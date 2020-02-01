<?php
// declare variables:
$data = $name = $countryCode = $turn = $difficulty = ""; // from user input
$json = $file = $content = $decoded = $encoded = ""; // for file handling
$index = $lastRecord = $currentIndex = $previousTurn = $change = ""; // dor sorting records

// functions:
// sanitize user input:
function testInput($data) {
    $data = trim($data);
    $data = stripslashes($data); // The stripslashes() function removes backslashes
    $data = htmlspecialchars($data);
    return $data;
}

function setRecord($index) {
    global $name, $countryCode, $turn, $decoded; // The global keyword is used to access a global variable from within a function.
    $decoded[$index] = array(
        "name" => $name,
        "countryCode" => $countryCode,
        "turn" => $turn,
        "date" => date("F j, Y, G:i")
    );
}

$data = json_decode($_POST["data"]);
//var_dump($data);
// --------------- validate all data from client: ---------------
$name = testInput($data -> name);
if (strlen($name) > 20) die ("Name too long");
if (strlen($name) < 1) die ("Missing name");
if (!(is_string($name))) die ("Invalid name");
if (!preg_match("/^[ öÖüÜóÓőŐúÚéÉáÁíÍ\w]*$/", $name)) die ("Invalid characters");
$countryCode = testInput($data -> countryCode);
if (strlen($countryCode) > 2) die ("Invalid countryCode");
if (!preg_match("/^[\w]*$/", $countryCode)) die ("Invalid characters in the countryCode");
$turn = testInput($data -> turn);
if (!(is_numeric($turn)) or $turn < 1) die ("Invalid turn");
$difficulty = testInput($data -> difficulty);
if ($difficulty !== "simon" and 
    $difficulty !== "human" and 
    $difficulty !== "alien") die ("Invalid difficulty")
;

// --------------- open json file: ---------------
$json = "../halloffame/" . $difficulty . ".json";
$file = fopen($json, "r") or die("Unable to open file!");
$content = fread($file, filesize($json));
fclose($file);
$decoded = json_decode($content);

// --------------- Save record to the last position: ---------------
if (count($decoded) < 10) {
    // if the Hall of Fame still does not contain 10 record:
    $index = $decoded[count($decoded) - 1] -> turn === "0" ? 0 : count($decoded);
    setRecord($index);
} else {
    // check if the user hit a record: 
    $lastRecord = $decoded[9] -> turn;
    if ($lastRecord >= $turn) {
        die ("No record found");
    } else {
        // record can save to the last place:
        date_default_timezone_set("Europe/London");
        $index = 9;
        setRecord($index);
    }
}

// --------------- Sort the new dataset: ---------------

if ($index) {
    $currentIndex = count($decoded) - 1;
    $previousTurn = $decoded[$currentIndex - 1] -> turn;
    // boule up the current index
    while ($turn > $previousTurn && $currentIndex > 0) {
        $change = $decoded[$currentIndex - 1];
        $decoded[$currentIndex - 1] = $decoded[$currentIndex];
        $decoded[$currentIndex] = $change;
        $currentIndex --;
        if ($currentIndex > 0) {
            $previousTurn = $decoded[$currentIndex - 1] -> turn;
        } 
    }
}

// --------------- Save the sorted array to the json file: ---------------
$file = fopen($json, "w") or die ("Unable to open file!");
$encoded = json_encode($decoded);
fwrite($file, $encoded);
fclose($file);

// --------------- Send the modified data back to the client: ---------------
echo $encoded;
?>
