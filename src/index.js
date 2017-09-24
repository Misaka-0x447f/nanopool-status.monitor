function update(){
    config = getConfig();
    arg = window.location.href + "/../api/interface.php?coinType=" + config["coinType"] + "&address=" + config["address"];

    if(config["coinType"] === "etc"){
        document.getElementById("balance-unit").innerHTML = "mETC";
        document.getElementById("hashrate-unit").innerHTML = "MHash/s now";
        document.getElementById("avgHashrate-unit").innerHTML = "MHash/s average";
        document.getElementById("estimatedEarnings-unit").innerHTML = "mETC/day";
    }
    if(config["coinType"] === "eth"){
        document.getElementById("balance-unit").innerHTML = "mETH";
        document.getElementById("hashrate-unit").innerHTML = "MHash/s now";
        document.getElementById("avgHashrate-unit").innerHTML = "MHash/s average";
        document.getElementById("estimatedEarnings-unit").innerHTML = "mETH/day";
    }

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
            if(data["status"] === "ok"){
                document.getElementById("balance").innerHTML = (data["balance"] * 1000).toFixed(config["accu"]);
            }
        },
        timeout:90000
    });

    //2.update hashrate
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        dataType: "html",
        url: arg + "&dataType=hashrate",
        success: function(data){
            data = JSON.parse(data);
            console.log(data);
            if(data["status"] === "ok"){
                document.getElementById("hashrate").innerHTML = data["hashrate"];
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
                if(data["status"] === "ok"){
                    document.getElementById("avgHashrate").innerHTML = data["avgHashrate"];
                }
                lastAvgSpeed = data["avgHashrate"];
            }
        },
        timeout:90000
    });

    
    if(typeof(lastAvgSpeed) !== "undefined"){
        //4.update calc
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            dataType: "html",
            url: arg + "&dataType=estimatedEarnings" + "&speed=" + lastAvgSpeed,
            success: function(data){
                data = JSON.parse(data);
                console.log(data);
                if(data["status"] === "ok"){
                    document.getElementById("estimatedEarnings").innerHTML = data["estimatedEarnings"]["day"]["coins"]*1000;
                }
            },
            timeout:90000
        });
        
        setTimeout(update, 15*1000);
    }else{
        setTimeout(update, 15*60*1000);
    }
}
