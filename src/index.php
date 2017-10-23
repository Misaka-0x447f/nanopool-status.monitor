<?php
/**
 * Created by PhpStorm.
 * Silence is gold.
 * User: Aozak
 * Date: 2017/9/24
 * Time: 17:18
 */
require("lib/fileOpt.php");
require("lib/debugConsoleOpt.php");
$fileOpt = new fileOpt();
$fileOpt->fileSelect("config.json");
$config = $fileOpt->jsonFileRead();
if (isset($_GET["config"]) and property_exists($config, $_GET["config"])) {
    $config = ((array)$config)[$_GET["config"]];
} else if (isset(((array)$config)["default"])) {
    $config = ((array)$config)["default"];
} else {
    exit("{\"status\":\"interrupted\",\"statusNo\":\"400.0\",\"message\":\"bad request. params may invalid in front page. check config.json.\"}");
}
?>
<meta charset="utf-8">
<title>
    sitBackAndControl
</title>
<link href="index.css<?php echo "?nocache=" . (string)rand() ?>" rel="stylesheet">
<script src="index.js<?php echo "?nocache=" . (string)rand() ?>"></script>
<script src="lib/jquery.js"></script>
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
                <span id="balance-unit" class="unit">
                    ---
                </span>
            </td>
            <td class="column-separator">
                -
            </td>
            <td class="left-align">
                <span id="avgHashrate-unit" class="unit">
                    ---
                </span>
                <span id="hr-avg" class="constant">
                    --hr. avg
                </span>
            </td>
        </tr>
        <tr class="digit-big">
            <td class="right-align">
                <span id="balance" class="digit">
                    .----
                </span>
            </td>
            <td class="column-separator">
                -
            </td>
            <td class="left-align">
                <span id="avgHashrate" class="digit">
                    .----
                </span>
            </td>
        </tr>
        <tr class="label-small">
            <td class="right-align">
                <span id="estimatedEarnings-unit" class="unit">
                    ---
                </span>
            </td>
            <td class="column-separator">
                -
            </td>
            <td class="left-align">
                <span id="hashrate-unit" class="unit">
                    ---
                </span>
                <span id="current" class="constant">
                    current
                </span>
            </td>
        </tr>
        <tr class="digit-small">
            <td class="right-align">
                <span id="estimatedEarnings" class="digit">
                    .----
                </span>
            </td>
            <td class="column-separator">
                -
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
                <span id="payments-unit" class="unit">
                    ---
                </span>
            </td>
            <td class="column-separator">
                -
            </td>
            <td class="left-align">
                <span id="prices-unit" class="unit">
                    ---
                </span>
                <span id="per-coin" class="constant">
                    per-coin
                </span>
            </td>
        </tr>
        <tr class="digit-small">
            <td class="right-align">
                <span id="payments" class="digit">
                    .----
                </span>
            </td>
            <td class="column-separator">
                -
            </td>
            <td class="left-align">
                <span id="prices" class="digit">
                    .----
                </span>
            </td>
        </tr>
    </table>
    <div id="console" style="display: none">

    </div>
    <div id="progress-bar">
        <div id="progress-bar-inner">

        </div>
    </div>
</div>
</body>
