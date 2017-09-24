<?php
/**
 * Created by PhpStorm.
 * Silence is gold.
 * User: Aozak
 * Date: 2017/9/24
 * Time: 17:18
 */
/*require("api/pool.php");
$poolOpt = new nanopoolEtcEth("etc", "57cda5f152e5da5c16952bc810ebee8235df7353");
$avgHashrate = $poolOpt->minerAverageHashrate(24)["avgHashrate"];
echo json_encode($poolOpt->minerEstimatedEarnings($avgHashrate));*/
require("functions.php");
$fileOpt = new fileOpt();
$fileOpt->fileSelect("config.json");
$config = $fileOpt->jsonFileRead();
if(isset($_GET["config"]) and property_exists($config, $_GET["config"])){
    $config = ((array)$config)[$_GET["config"]];
}else if(isset(((array)$config)["default"])){
    $config = ((array)$config)["default"];
}else{
    exit("{\"status\":\"interrupted\",\"statusNo\":\"400.0\",\"message\":\"bad request. params may invalid.\"}");
}
?>
<meta charset="utf-8">
<title>
    sitBackAndControl
</title>
<link href="index.css" rel="stylesheet">
<script src="index.js<?php echo "?nocache=" . (string)rand() ?>"></script>
<script src="lib/jquery.js"></script>
<script>
    $(document).ready(function(){
        setTimeout(update,3*1000);
        setInterval(update,30*60*1000);
    });
    <?php
        echo '
            function getConfig(){
                var config = ' . (string)json_encode($config) . ';
                console.log(config);
                return config;
            }
        '
    ?>
</script>
<body>
<div id="container">
    <span id="balance">
        ---.-
    </span>
    <span id="balance-unit">

    </span>
    <br/>
    <span id="hashrate">

    </span>
    <span id="hashrate-unit">

    </span>
    <br/>
    <span id="avgHashrate">

    </span>
    <span id="avgHashrate-unit">

    </span>
    <br/>
    <span id="estimatedEarnings">

    </span>
    <span id="estimatedEarnings-unit">

    </span>
</div>
</body>
