<?php
$json = "../halloffame/" . $_REQUEST["difficulty"] . ".json";
$file = fopen($json, "r") or die("Unable to open file!");
$content = fread($file, filesize($json));
fclose($file);
echo $content;
?>
