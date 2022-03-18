<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */
//simple script to connect your backend and your front end i made it because i had a cors-origin problems
error_reporting(0);
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

$action = isset($_GET["action"]) ? $_GET["action"] : "";
$postData = $action != "" ? file_get_contents("php://input") : "";
$server = "http://127.0.0.1/backend/index.php?action=" . $action;

die(postJson($server, $postData));


function postJson($url, $payload)
{

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);

    return $result;
}


