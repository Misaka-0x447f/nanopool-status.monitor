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
if (isset($_GET["config"]) and property_exists($config, $_GET["config"])) {
    $config = ((array)$config)[$_GET["config"]];
} else if (isset(((array)$config)["default"])) {
    $config = ((array)$config)["default"];
} else {
    exit("{\"status\":\"interrupted\",\"statusNo\":\"400.0\",\"message\":\"bad request. params may invalid.\"}");
}
?>
<meta charset="utf-8">
<title>
    sitBackAndControl
</title>
<link href="index.css" rel="stylesheet">
<script src="index.js<?php echo "?nocache=" . (string)rand() ?>"></script>
<script src="lib/jquery.js<?php echo "?nocache=" . (string)rand() ?>"></script>
<script>
    $(document).ready(function () {
        setTimeout(update, 3 * 1000);
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
    <table>
        <tr class="label-big">
            <td class="right-align">
                <span id="in-pool" class="constant">
                    in-pool
                </span>
                <span id="balance" class="unit">
                    ---
                </span>
            </td>
            <td class="left-align">
                <span id="avgHashrate" class="unit">
                    ---
                </span>
                <span id="24hr.avg" class="constant">
                    24hr. avg
                </span>
            </td>
        </tr>
        <tr class="digit-big">
            <td class="right-align">
                <span id="balance" class="digit">
                    .----
                </span>
            </td>
            <td class="left-align">
                <span id="avgHashrate" class="digit">
                    .----
                </span>
            </td>
        </tr>
        <tr class="label-small">
            <td class="right-align">
                <span id="estimatedEarnings" class="unit">
                    ---
                </span>
            </td>
            <td class="left-align">
                <span id="hashrate" class="unit">
                    ---
                </span>
            </td>
        </tr>
        <tr class="digit-small">
            <td class="right-align">
                <span id="estimatedEarnings" class="digit">
                    .----
                </span>
            </td>
            <td class="left-align">
                <span id="hashrate" class="digit">
                    .----
                </span>
            </td>
        </tr>
        <tr class="label-small">
            <td class="right-align">
                <span id="total-paid" class="constant">
                    total-paid
                </span>
                <span id="paid" class="unit">
                    ---
                </span>
            </td>
            <td class="left-align">
                <span id="price" class="unit">
                    ---
                </span>
            </td>
        </tr>
        <tr class="digit-small">
            <td class="right-align">
                <span id="paid" class="digit">
                    .----
                </span>
            </td>
            <td class="left-align">
                <span id="price" class="digit">
                    .----
                </span>
            </td>
        </tr>
    </table>
</div>
</body>
