function update(){
    config = getConfig();
    var arg = window.location.href + "/../api/interface.php?coinType=" + config["coinType"] + "&address=" + config["address"];

    $("html").css("font-size", 60*(document.body.offsetWidth/1920) + "px");

    if(config["coinType"] === "etc"){
        unit = {
            "base":{
                "coin":"ETC",
                "rate":"hash/s",
                "coinRate":"ETC/day",
                "currency":"CNY"
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
                "coinRate":"ETH/day",
                "currency":"CNY"
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

    //1.update balance
    console.log("requesting");
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=balance",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(isNumeric(data["balance"])){
                var value = Number(data["balance"]);
                var level = getOrderOfMagnitudeF(value);
                document.getElementById("balance").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                document.getElementById("balance-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["balance"]))
                    + unit["base"]["coin"];
                //changeReadyStatus
                readyStatus["loadData"]["balance"] = 1
            }
        },
        timeout:90000
    });

    //2.update hashrate
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=hashrateHistory",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(isNumeric(data["hashrateHistory"][0]["hashrate"])){
                var value = Number(data["hashrateHistory"][0]["hashrate"]);
                console.log(value);
                var level = getOrderOfMagnitudeF(value);
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
        url: arg + "&dataType=avgHashrate",
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
            if(isNumeric(data["prices"]["price_cny"])){
                var value = data["prices"]["price_cny"];
                console.log(value);
                var level = getOrderOfMagnitudeF(value);
                document.getElementById("prices").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                document.getElementById("prices-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["prices"]))
                    + unit["base"]["currency"];
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
    setTimeout(update, 15*60*1000);
    console.log("update interval set to 15 minutes");
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