function update(){
    config = getConfig();
    if(config["priceUnit"] === undefined){
        config["priceUnit"] = "usd";
    }
    if(config["avgRange"] === undefined){
        config["avgRange"] = 6;
    }
    if(config["updateInterval"] === undefined){
        config["updateInterval"] = 5;
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
    //record readyStatus
    readyStatus = {
        "loadData":{
            "balance":0,
            "hashrate":0,
            "avgHashrate":0,
            "estimatedEarns":0,
            "payments":0,
            "prices":0
        }
    };

    //1.update balance 2.update hashrate
    console.log("requesting");
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=balance_hashrate",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(isNumeric(data["data"]["balance"])){
                value = Number(data["data"]["balance"]);
                var level = getOrderOfMagnitudeF(value);
                document.getElementById("balance").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                document.getElementById("balance-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["balance"]))
                    + unit["base"]["coin"];
                //changeReadyStatus
                readyStatus["loadData"]["balance"] = 1
            }
            if(isNumeric(data["data"]["hashrate"])){
                value = Number(data["data"]["hashrate"]);
                console.log(value);
                level = getOrderOfMagnitudeF(value);
                document.getElementById("hashrate").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                document.getElementById("hashrate-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["hashrate"]))
                    + unit["base"]["rate"];
                readyStatus["loadData"]["hashrate"] = 1
            }
        },
        timeout:90000
    });

    //3.update avgHashrate
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=avgHashrate&avgRange=" + config["avgRange"],
        success: function(data){
            data = JSON.parse(data);
            if(data["status"] === "ok"){
                console.log(data);
                if(isNumeric(data["avgHashrate"])){
                    var value = Number(data["avgHashrate"]);
                    console.log(value);
                    var level = getOrderOfMagnitudeF(value);
                    document.getElementById("avgHashrate").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                    document.getElementById("avgHashrate-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["avgHashrate"]))
                        + unit["base"]["rate"];
                    document.getElementById("hr-avg").innerHTML = config["avgRange"] + "hr. avg";
                    readyStatus["loadData"]["avgHashrate"] = 1
                }
                lastAvgSpeed = Number(data["avgHashrate"]);
            }
        },
        timeout:90000
    });

    
    if(typeof(lastAvgSpeed) === "number"){
        //4.update calc
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            dataType: "html",
            url: arg + "&dataType=estimatedEarnings" + "&speed=" + lastAvgSpeed,
            success: function(data){
                data = JSON.parse(data);
                console.log(data);
                if(isNumeric(data["estimatedEarnings"]["day"]["coins"])){
                    var value = Number(data["estimatedEarnings"]["day"]["coins"]);
                    console.log(value);
                    var level = getOrderOfMagnitudeF(value);
                    document.getElementById("estimatedEarnings").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                    document.getElementById("estimatedEarnings-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["estimatedEarnings"]))
                        + unit["base"]["coinRate"];
                    readyStatus["loadData"]["estimatedEarnings"] = 1
                }
            },
            timeout:90000
        });
    }

    //5.update total-payments
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
                readyStatus["loadData"]["payments"] = 1
            }
        },
        timeout:90000
    });

    //6.update prices
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
                readyStatus["loadData"]["prices"] = 1
            }
        },
        timeout:90000
    });

    //check if all value ready
    for (i in readyStatus){
        if(i !== 1){
            setTimeout(update, 20*1000);
            console.log("update interval set to 20 seconds");
            return 1;
        }
    }
    setTimeout(update, Number(config["updateInterval"])*60*1000);
    console.log("update interval set to " + config["updateInterval"] + " minutes");
    return 0;
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
    value = getOrderOfMagnitude(digit);
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
    if(typeof n !== "undefined"){
        return !isNaN(parseFloat(n)) && isFinite(n);
    }else{
        return false;
    }
}