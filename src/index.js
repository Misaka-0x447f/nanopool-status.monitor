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
    if(config["noUpdateTimerBar"] === "true"){
        document.getElementById("progress-bar").style.display = "none"
    }
    arg = window.location.href.split("?") + "/../api/interface.php?coinType=" + config["coinType"] + "&address=" + config["address"];

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

    netStatus = {
        "balanceAndHashrate":{
            "status":"null",
            "retryCount":0,
            "nextUpdate":0           //millionSeconds
        },
        "avgHashrate":{
            "status":"null",
            "retryCount":0,
            "nextUpdate":0
        },
        "calc":{
            "status":"null",
            "retryCount":0,
            "nextUpdate":0
        },
        "totalPayments":{
            "status":"null",
            "retryCount":0,
            "nextUpdate":0
        },
        "prices":{
            "status":"null",
            "retryCount":0,
            "nextUpdate":0
        }
    };

    netLastInfo = "initializing...";
    lastHashrate = 1000;

    RETRY_TIME_LIST = [15, 30, 60];

    initialNetStyle();

    updateGUI();

    //1.update balance 2.update hashrate
    updateBalanceAndHashrate();

    //3.update avgHashrate
    updateAvgHashrate();

    //4.update calc: this will be done after avgHashrate refresh.
    //updateCalc();

    //5.update total-payments
    updateTotalPayments();

    //6.update prices
    updatePrices();

}
function updateGUI(){
    $("html").css("font-size", 60*(window_width()/1920) + "px");
    $("table").css("font-size", 60*(window_width()/1920) + "px")
        .css("margin-top", 2.5*(window_height()/1080) + "rem");
    for(i in netStatus){
        if(netStatus.hasOwnProperty(i) && netStatus[i].hasOwnProperty("nextUpdate") && (min === undefined || netStatus[i]["nextUpdate"] < min)){
            var min = netStatus[i]["nextUpdate"];
        }
    }

    var barWidth = 29;

    document.getElementById("progress-bar").style.width = barWidth + "rem";
    document.getElementById("progress-bar-inner").style.width = (min - Date.now()) / (config["updateInterval"] * 60 * 1000) * barWidth + "rem";

    var flashInterval = 800;
    var flashPeriod   = 15000;
    var flashTimes    = 3;
    var flashColor    = ["ff", "44", "33"];
    var flashFactor = 1 - ((Date.now() % flashPeriod) % flashInterval) / flashInterval; //0..1

    function flashGetColorFactor(color){
        return (Math.floor(parseInt(color, 16) * flashFactor)).toString(16);
    }
    function flashGetColor(){
        var color = "#";
        for(i=0; i<3; i++) {
            var result = flashGetColorFactor(flashColor[i]);
            if(result.length === 1){
                result = "0" + result;
            }
            color += result;
        }
        return color;
    }

    if(lastHashrate === 0){
        if(Date.now() % flashPeriod < flashInterval * flashTimes * 0.95){
            document.body.style.backgroundColor = flashGetColor();
        }else{
            document.body.style.backgroundColor = "#000";
        }

        function setStyleRedBlack(idList){
            for(i in idList){
                if(idList.hasOwnProperty(i)){
                    document.getElementById(idList[i]).style.color = "#000";
                    document.getElementById(idList[i]).parentNode.style.backgroundColor = "#f43";
                }
            }
        }
        setStyleRedBlack(["hashrate-unit", "current", "hashrate"]);
    }else{
        if(document.getElementById("hashrate").parentNode.style.backgroundColor === "rgb(255, 68, 51)"){
            document.body.style.backgroundColor = "#000";
            function setStyleBlackBlue(idList){
                for(i in idList){
                    if(idList.hasOwnProperty(i)){
                        document.getElementById(idList[i]).style.color = "#6cf";
                        document.getElementById(idList[i]).parentNode.style.backgroundColor = "#000";
                    }
                }
            }
            setStyleBlackBlue(["hashrate-unit", "current", "hashrate"]);
        }
    }

    setTimeout(updateGUI, 25);
}
function txt(requests, txt1){
    txtContent = {
        "net_bah_requesting":"requesting balance and hashrate...",
        "net_avg_requesting":"requesting average hashrate...",
        "net_calc_requesting":"requesting mining speed...",
        "net_payment_requesting":"requesting total payment...",
        "net_price_requesting":"requesting prices...",
        "net_bah_retry":"retry request balance and hashrate in " + txt1 + " seconds...",
        "net_avg_retry":"retry request average hashrate in " + txt1 + " seconds...",
        "net_calc_retry":"retry request mining speed in " + txt1 + " seconds...",
        "net_payment_retry":"retry request total payment in " + txt1 + " seconds...",
        "net_price_retry":"retry request price in " + txt1 + " seconds...",
        "net_bah_success":"done request balance and hashrate.",
        "net_avg_success":"done request average hashrate.",
        "net_calc_success":"done request mining speed.",
        "net_payment_success":"done request total payment.",
        "net_price_success":"done request price.",
        "net_missing_hashrate":"missing hashrate. cannot request mining speed."
    };

    document.getElementById("console").innerHTML = txtContent[requests];

    return txtContent[requests];
}
function setNetStyle(id, style){
    if(style === "init"){
        document.getElementById(id).style.color = "#236";
    }else if(style === "done"){
        document.getElementById(id).style.color = "#6cf";
    }else if(style === "requesting"){
        document.getElementById(id).style.color = "#57a";
    }else if(style === "retrying"){
        document.getElementById(id).style.color = "#f77";
    }
}
function initialNetStyle(){
    setNetStyle("balance", "init");
    setNetStyle("hashrate", "init");
    setNetStyle("avgHashrate", "init");
    setNetStyle("estimatedEarnings", "init");
    setNetStyle("payments", "init");
    setNetStyle("prices", "init");
}

function updateBalanceAndHashrate(){
    netStatus["balanceAndHashrate"]["status"] = "requesting";
    netLastInfo = txt("net_bah_requesting");
    setNetStyle("balance", "requesting");
    setNetStyle("hashrate", "requesting");
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=balance_hashrate",
        success: function(data){
            try{
                data = JSON.parse(data);
                console.log(data);
                if(data.hasOwnProperty("data", "balance") && isNumeric(data["data"]["balance"])){
                    var value1 = Number(data["data"]["balance"]); //in some cases, balance can be under zero
                    if(value1 < 0){
                        value1 = 0
                    }
                    var level1 = getOrderOfMagnitudeF(value1);
                    document.getElementById("balance").innerHTML = (value1*Math.pow(10,-level1)).toPrecision(4);
                    document.getElementById("balance-unit").innerHTML = getOrderOfMagnitudeName(value1 * Math.pow(10, unit["api"]["balance"]))
                        + unit["base"]["coin"];
                }else{
                    return retryBalanceAndHashrate();
                }
                if(data.hasOwnProperty("data") && data["data"].hasOwnProperty("hashrate") && isNumeric(data["data"]["hashrate"])){
                    var value2 = Number(data["data"]["hashrate"]);
                    lastHashrate = value2;
                    console.log("lastHashrate: " + value2);
                    var level2 = getOrderOfMagnitudeF(value2);
                    document.getElementById("hashrate").innerHTML = (value2*Math.pow(10,-level2)).toPrecision(4);
                    document.getElementById("hashrate-unit").innerHTML = getOrderOfMagnitudeName(value2 * Math.pow(10, unit["api"]["hashrate"]))
                        + unit["base"]["rate"];
                    if(lastHashrate === 0){
                        return retryBalanceAndHashrate(true)
                    }
                }else{
                    return retryBalanceAndHashrate();
                }
                return successBalanceAndHashrate();
            }catch(e){
                console.log('Caught: '+ e);
            }
        },
        error: function(){
            return retryBalanceAndHashrate();
        },
        timeout:30000
    });
    function retryBalanceAndHashrate(noStyle){
        timer = RETRY_TIME_LIST[limitRange(netStatus["balanceAndHashrate"]["retryCount"], 0, RETRY_TIME_LIST.length - 1)];
        setTimeout(updateBalanceAndHashrate, timer*1000);
        netStatus["balanceAndHashrate"]["status"] = "retrying";
        netStatus["balanceAndHashrate"]["retryCount"]++;
        netLastInfo = txt("net_bah_retry", timer);
        if(noStyle !== true){
            setNetStyle("balance", "retrying");
            setNetStyle("hashrate", "retrying");
        }else{
            setNetStyle("balance", "done");
            setNetStyle("hashrate", "retrying");
        }
        netStatus["balanceAndHashrate"]["nextUpdate"] = Date.now() + timer * 1000;
        return false;
    }
    function successBalanceAndHashrate(){
        setTimeout(updateBalanceAndHashrate, Number(config["updateInterval"])*60*1000);
        netStatus["balanceAndHashrate"]["status"] = "done";
        netStatus["balanceAndHashrate"]["retryCount"] = 0;
        netLastInfo = txt("net_bah_success");
        setNetStyle("balance", "done");
        setNetStyle("hashrate", "done");
        netStatus["balanceAndHashrate"]["nextUpdate"] = Date.now() + Number(config["updateInterval"])*60*1000;
        return true;
    }
}
function updateAvgHashrate(){
    netStatus["avgHashrate"]["status"] = "requesting";
    netLastInfo = txt("net_avg_requesting");
    setNetStyle("avgHashrate", "requesting");
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=avgHashrate&avgRange=" + config["avgRange"],
        success: function(data){
            try{
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
                    return retryAvgHashrate();
                }
                return successAvgHashrate();
            }catch(e){
                console.log('Caught: '+ e);
            }
        },
        error: function () {
            return retryAvgHashrate();
        },
        timeout:30000
    });
    function retryAvgHashrate(){
        timer = RETRY_TIME_LIST[limitRange(netStatus["avgHashrate"]["retryCount"], 0, RETRY_TIME_LIST.length - 1)];
        setTimeout(updateAvgHashrate, timer*1000);
        netStatus["avgHashrate"]["status"] = "retrying";
        netStatus["avgHashrate"]["retryCount"]++;
        netLastInfo = txt("net_avg_retry", timer);
        setNetStyle("avgHashrate", "retrying");
        netStatus["avgHashrate"]["nextUpdate"] = Date.now() + timer * 1000;
        return false;
    }
    function successAvgHashrate(){
        updateCalc();
        setTimeout(updateAvgHashrate, Number(config["updateInterval"])*60*1000);
        netStatus["avgHashrate"]["status"] = "done";
        netStatus["avgHashrate"]["retryCount"] = 0;
        setNetStyle("avgHashrate", "done");
        netStatus["avgHashrate"]["nextUpdate"] = Date.now() + Number(config["updateInterval"])*60*1000;
        return true;
    }
}
function updateCalc(){
    if(typeof(lastAvgSpeed) !== "undefined"){
        netStatus["calc"]["status"] = "requesting";
        netLastInfo = txt("net_calc_requesting");
        setNetStyle("estimatedEarnings", "requesting");
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            dataType: "html",
            url: arg + "&dataType=estimatedEarnings" + "&speed=" + lastAvgSpeed,
            success: function(data){
                try{
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
                        return retryCalc();
                    }
                    return successCalc();
                }catch(e){
                    console.log('Caught: '+ e);
                }
            },
            error: function () {
                return retryCalc();
            },
            timeout:90000
        });
    }else{
        netLastInfo = txt("net_missing_hashrate");
        return retryCalc();
    }
    function retryCalc(){
        timer = RETRY_TIME_LIST[limitRange(netStatus["calc"]["retryCount"], 0, RETRY_TIME_LIST.length - 1)];
        setTimeout(updateCalc, timer*1000);
        netStatus["calc"]["status"] = "retrying";
        netStatus["calc"]["retryCount"]++;
        netLastInfo = txt("net_calc_retry", timer);
        setNetStyle("estimatedEarnings", "retrying");
        netStatus["calc"]["nextUpdate"] = Date.now() + timer * 1000;
        return false;
    }
    function successCalc(){
        netStatus["calc"]["status"] = "done";
        netStatus["calc"]["retryCount"] = 0;
        netLastInfo = txt("net_calc_success");
        setNetStyle("estimatedEarnings", "done");
        netStatus["calc"]["nextUpdate"] = Date.now() + Number(config["updateInterval"])*60*1000;
        //exec while request avgSpeed success.
        /*
        setTimeout(updateCalc, Number(config["updateInterval"])*60*1000);
        */
        return true;
    }
}
function updateTotalPayments(){
    netStatus["totalPayments"]["status"] = "requesting";
    netLastInfo = txt("net_payment_requesting");
    setNetStyle("payments", "requesting");
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=payments",
        success: function(data){
            try{
                data = JSON.parse(data);
                console.log(data);
                if(data.hasOwnProperty("sum") && isNumeric(data["sum"])){
                    var value = Number(data["sum"]);
                    console.log(value);
                    var level = getOrderOfMagnitudeF(value);
                    document.getElementById("payments").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                    document.getElementById("payments-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["payments"]))
                        + unit["base"]["coin"];
                }else{
                    return retryTotalPayments();
                }
                return successTotalPayments();
            }catch(e){
                console.log('Caught: '+ e);
            }
        },
        error: function () {
            return retryTotalPayments();
        },
        timeout:90000
    });
    function retryTotalPayments(){
        timer = RETRY_TIME_LIST[limitRange(netStatus["totalPayments"]["retryCount"], 0, RETRY_TIME_LIST.length - 1)];
        setTimeout(updateTotalPayments, timer*1000);
        netStatus["totalPayments"]["status"] = "retrying";
        netStatus["totalPayments"]["retryCount"]++;
        netLastInfo = txt("net_payment_retry", timer);
        setNetStyle("payments", "retrying");
        netStatus["totalPayments"]["nextUpdate"] = Date.now() + timer * 1000;
        return false;
    }
    function successTotalPayments(){
        setTimeout(updateTotalPayments, Number(config["updateInterval"])*60*1000);
        netStatus["totalPayments"]["status"] = "done";
        netStatus["totalPayments"]["retryCount"] = 0;
        netLastInfo = txt("net_payment_success");
        setNetStyle("payments", "done");
        netStatus["totalPayments"]["nextUpdate"] = Date.now() + Number(config["updateInterval"])*60*1000;
        return true;
    }
}
function updatePrices(){
    netStatus["prices"]["status"] = "requesting";
    netLastInfo = txt("net_price_requesting");
    setNetStyle("prices", "requesting");
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=prices",
        success: function(data){
            try{
                data = JSON.parse(data);
                console.log(data);
                if(data.hasOwnProperty("prices", "price_" + config["priceUnit"]) && isNumeric(data["prices"]["price_" + config["priceUnit"]])){
                    var value = data["prices"]["price_" + config["priceUnit"]];
                    document.getElementById("prices-unit").innerHTML = getOrderOfMagnitudeName(value * Math.pow(10, unit["api"]["prices"]))
                        + config["priceUnit"].toUpperCase();
                    console.log(value);
                    var level = getOrderOfMagnitudeF(value);
                    document.getElementById("prices").innerHTML = (value*Math.pow(10,-level)).toPrecision(4);
                }else{
                    return retryPrices();
                }
                return successPrices();
            }catch(e){
                console.log('Caught: '+ e);
            }
        },
        error: function () {
            return retryPrices();
        },
        timeout:90000
    });
    function retryPrices(){
        timer = RETRY_TIME_LIST[limitRange(netStatus["prices"]["retryCount"], 0, RETRY_TIME_LIST.length - 1)];
        setTimeout(updatePrices, timer*1000);
        netStatus["prices"]["status"] = "retrying";
        netStatus["prices"]["retryCount"]++;
        netLastInfo = txt("net_price_retry", timer);
        setNetStyle("prices", "retrying");
        netStatus["prices"]["nextUpdate"] = Date.now() + timer * 1000;
        return false;
    }
    function successPrices(){
        setTimeout(updatePrices, Number(config["updateInterval"])*60*1000);
        netStatus["prices"]["status"] = "done";
        netStatus["prices"]["retryCount"] = 0;
        netLastInfo = txt("net_price_success");
        setNetStyle("prices", "done");
        netStatus["prices"]["nextUpdate"] = Date.now() + Number(config["updateInterval"])*60*1000;
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
function limitRange(variable, floor, ceil){
    if(variable < floor){
        variable = floor
    }
    if(variable > ceil){
        variable = ceil
    }
    return variable
}
function window_width(){
    return window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth
        || 0;
}
function window_height(){
    return window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight
    || 0;
}