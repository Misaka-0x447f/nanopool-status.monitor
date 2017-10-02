function update(){
    config = getConfig();
    if(config["priceUnit"] === undefined){
        config["priceUnit"] = "usd";
    }
    if(config["avgRange"] === undefined){
        config["avgRange"] = 6;
    }
    if(config["updateInterval"] === undefined){
        config["updateInterval"] = 10;
    }
    arg = window.location.href.split("?") + "/../api/interface.php?coinType=" + config["coinType"] + "&address=" + config["address"];

    $("html").css("font-size", 60*(document.body.offsetWidth/1920) + "px");

    if(config["coinType"] === "etc"){
        unit = {
            "base":{
                "coin":"ETC",
                "rate":"hash/s",
                "coinRate":"ETC/day"
            },
            "api":{                     // index of order of magnitude
                "balance":0,
                "hashrate":6,           // MH/s
                "avgHashrate":6,
                "estimatedEarnings":0,
                "payments":0,
                "prices":0
            }
        }
    }
    if(config["coinType"] === "eth"){
        unit = {
            "base":{
                "coin":"ETH",
                "rate":"hash/s",
                "coinRate":"ETH/day"
            },
            "api":{                     // index of order of magnitude
                "balance":0,
                "hashrate":6,           // MH/s
                "avgHashrate":6,
                "estimatedEarnings":0,
                "payments":0,
                "prices":0
            }
        }
    }
    if(config["coinType"] === "xmr"){
        unit = {
            "base":{
                "coin":"XMR",
                "rate":"hash/s",
                "coinRate":"XMR/day"
            },
            "api":{                     // index of order of magnitude
                "balance":0,
                "hashrate":0,           // H/s
                "avgHashrate":0,
                "estimatedEarnings":0,
                "payments":0,
                "prices":0
            }
        }
    }
    if(config["coinType"] === "zec"){
        unit = {
            "base":{
                "coin":"ZEC",
                "rate":"sol/s",
                "coinRate":"ZEC/day"
            },
            "api":{                     // index of order of magnitude
                "balance":0,
                "hashrate":0,           // sol/s
                "avgHashrate":0,
                "estimatedEarnings":0,
                "payments":0,
                "prices":0
            }
        }
    }

    //1.update balance 2.update hashrate
    updateBalanceAndHashrate();

    //3.update avgHashrate
    updateAvgHashrate();

    //4.update calc
    updateCalc();

    //5.update total-payments
    updateTotalPayments();

    //6.update prices
    updatePrices();

}
function updateBalanceAndHashrate(){
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=balance_hashrate",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(data.hasOwnProperty("data", "balance") && isNumeric(data["data"]["balance"])){
                var value1 = Number(data["data"]["balance"]);
                var level1 = getOrderOfMagnitudeF(value1);
                document.getElementById("balance").innerHTML = (value1*Math.pow(10,-level1)).toPrecision(4);
                document.getElementById("balance-unit").innerHTML = getOrderOfMagnitudeName(value1 * Math.pow(10, unit["api"]["balance"]))
                    + unit["base"]["coin"];
            }else{
                return retryBalanceAndHashrate();
            }
            if(data.hasOwnProperty("data") && data["data"].hasOwnProperty("hashrate") && isNumeric(data["data"]["hashrate"])){
                var value2 = Number(data["data"]["hashrate"]);
                console.log(value2);
                var level2 = getOrderOfMagnitudeF(value2);
                document.getElementById("hashrate").innerHTML = (value2*Math.pow(10,-level2)).toPrecision(4);
                document.getElementById("hashrate-unit").innerHTML = getOrderOfMagnitudeName(value2 * Math.pow(10, unit["api"]["hashrate"]))
                    + unit["base"]["rate"];
            }else{
                return retryBalanceAndHashrate();
            }
            successBalanceAndHashrate();
        },
        error: function(){
            return retryBalanceAndHashrate();
        },
        timeout:30000
    });
    function retryBalanceAndHashrate(){
        setTimeout(updateBalanceAndHashrate, 30*1000);
        console.log("retry in 30 seconds");
        return false;
    }
    function successBalanceAndHashrate(){
        setTimeout(updateBalanceAndHashrate, Number(config["updateInterval"])*60*1000);
        console.log("update interval set to " + config["updateInterval"] + " minutes");
        return true;
    }
}
function updateAvgHashrate(){
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=avgHashrate&avgRange=" + config["avgRange"],
        success: function(data){
            data = JSON.parse(data);
            if(data["status"] === "ok"){
                console.log(data);
                if(data.hasOwnProperty("avgHashrate") && isNumeric(data["avgHashrate"])){
                    var value = Number(data["avgHashrate"]);
                    console.log(value);
                    var level = getOrderOfMagnitudeF(value);
                    document.getElementById("avgHashrate").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                    document.getElementById("avgHashrate-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["avgHashrate"]))
                        + unit["base"]["rate"];
                    document.getElementById("hr-avg").innerHTML = config["avgRange"] + "hr. avg";
                }
                lastAvgSpeed = Number(data["avgHashrate"]);
            }else{
                retryAvgHashrate();
            }
            successAvgHashrate();
        },
        error: function () {
            retryAvgHashrate();
        },
        timeout:30000
    });
    function retryAvgHashrate(){
        setTimeout(updateAvgHashrate, 30*1000);
        console.log("retry in 30 seconds");
        return false;
    }
    function successAvgHashrate(){
        setTimeout(updateAvgHashrate, Number(config["updateInterval"])*60*1000);
        console.log("update interval set to " + config["updateInterval"] + " minutes");
        return true;
    }
}
function updateCalc(){
    if(typeof(lastAvgSpeed) === "number"){
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            dataType: "html",
            url: arg + "&dataType=estimatedEarnings" + "&speed=" + lastAvgSpeed,
            success: function(data){
                data = JSON.parse(data);
                console.log(data);
                if(data.hasOwnProperty("estimatedEarnings", "day", "coins") && isNumeric(data["estimatedEarnings"]["day"]["coins"])){
                    var value = Number(data["estimatedEarnings"]["day"]["coins"]);
                    console.log(value);
                    var level = getOrderOfMagnitudeF(value);
                    document.getElementById("estimatedEarnings").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                    document.getElementById("estimatedEarnings-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["estimatedEarnings"]))
                        + unit["base"]["coinRate"];
                }else{
                    retryCalc();
                }
                successCalc();
            },
            error: function () {
                retryCalc();
            },
            timeout:90000
        });
    }
    function retryCalc(){
        setTimeout(updateCalc, 30*1000);
        console.log("retry in 30 seconds");
        return false;
    }
    function successCalc(){
        setTimeout(updateCalc, Number(config["updateInterval"])*60*1000);
        console.log("update interval set to " + config["updateInterval"] + " minutes");
        return true;
    }
}
function updateTotalPayments(){
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=payments",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(isNumeric(data["sum"])){
                var value = Number(data["sum"]);
                console.log(value);
                var level = getOrderOfMagnitudeF(value);
                document.getElementById("payments").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                document.getElementById("payments-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["payments"]))
                    + unit["base"]["coin"];
            }else{
                retryTotalPayments();
            }
            successTotalPayments();
        },
        error: function () {
            retryTotalPayments();
        },
        timeout:90000
    });
    function retryTotalPayments(){
        setTimeout(updateTotalPayments, 30*1000);
        console.log("retry in 30 seconds");
        return false;
    }
    function successTotalPayments(){
        setTimeout(updateTotalPayments, Number(config["updateInterval"])*60*1000);
        console.log("update interval set to " + config["updateInterval"] + " minutes");
        return true;
    }
}
function updatePrices(){
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=prices",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(isNumeric(data["prices"]["price_" + config["priceUnit"]])){
                var value = data["prices"]["price_" + config["priceUnit"]];
                document.getElementById("prices-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["prices"]))
                    + config["priceUnit"].toUpperCase();
                console.log(value);
                var level = getOrderOfMagnitudeF(value);
                document.getElementById("prices").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
            }else{
                retryPrices();
            }
            successPrices();
        },
        error: function () {
            retryPrices();
        },
        timeout:90000
    });
    function retryPrices(){
        setTimeout(updatePrices, 30*1000);
        console.log("retry in 30 seconds");
        return false;
    }
    function successPrices(){
        setTimeout(updatePrices, Number(config["updateInterval"])*60*1000);
        console.log("update interval set to " + config["updateInterval"] + " minutes");
        return true;
    }
}
function getOrderOfMagnitudeName(digit){//receiving a data, not data magnitude
    digit = Number(digit);
    var listOfMag = {
        "-27":"x", "-24":"y", "-21":"z",
        "-18":"a", "-15":"f", "-12":"p",
        "-9":"n", "-6":"u", "-3":"m",
        "0":"",
        "3":"k", "6":"M", "9":"G",
        "12":"T", "15":"P", "18":"E",
        "21":"Z", "24":"Y", "27":"X"
    };
    return listOfMag[getOrderOfMagnitudeF(digit).toString()];
}
function getOrderOfMagnitudeF(digit){
    digit = Number(digit);
    var value = getOrderOfMagnitude(digit);
    value = Math.floor(value / 3) * 3;
    return value;
}
function getOrderOfMagnitude(digit){
    digit = Number(digit);
    if(digit === 0){
        return 1;
    }
    return Math.log10(digit);
}
function isNumeric(n){
    if(n !== undefined){
        return !isNaN(parseFloat(n)) && isFinite(n);
    }else{
        return false;
    }
}