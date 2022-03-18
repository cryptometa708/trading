<?php
error_reporting(0);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

include_once "vendor/autoload.php";
include_once "classes/Helper.php";
include_once "classes/Trade.php";
include_once "classes/User.php";
include_once "classes/Connection.php";
include_once "classes/Exchange.php";
include_once "classes/Database.php";
include_once "classes/Command.php";


$action = isset($_GET["action"]) ? $_GET["action"] : "";
$id = isset($_GET["id"]) ? $_GET["id"] : NULL;
$postData = $action != "" ? file_get_contents("php://input") : "";
$data = json_decode($postData, true);

$command = Command::getInstance();

switch ($action) {
    case "exchanges":
        die($command->exchanges());

    case "trades":
        $exchangeId = isset($data["exchangeId"]) ? $data["exchangeId"] : NULL;
        $userId = isset($data["userId"]) ? $data["userId"] : NULL;
        if ($userId && $exchangeId) {
            $trades = $command->trades($userId, $exchangeId);
            die($trades != null ? json_encode($trades) : '{"code":404}');
        }
        die('{"code":403}');
    case "login":
        $username = isset($data["username"]) ? $data["username"] : NULL;
        $password = isset($data["password"]) ? $data["password"] : NULL;
        if ($username && $password) {
            $user = $command->login($username, $password);
            if ($user != null) {
                $exchanges = $command->userExchanges($user->getId());
                $return = array("exchanges" => $exchanges, "user" => $user);
                die(json_encode($return));
            }
            die('{"code":404}');
        }
        die('{"code":404}');
    case "create_order":
        if (isset($data["ticker"])) {
            die($command->save_trade($data));
        }
        die('{"code":403}');
    case "close_order":
        if (isset($data["id"])) {
            die($command->execute_trade($data["id"], 2, 1));
        }
        die('{"code":403}');
    case "cancel_order":
        $id = isset($data["id"]) ? $data["id"] : NULL;
        if ($id) {
            die($command->cancel_trade($id));
        }
        die('{"code":403}');
    case "register":
        $username = isset($data["username"]) ? $data["username"] : "";
        $password = isset($data["password"]) ? $data["password"] : "";
        $exchange = isset($data["exchange"]) ? $data["exchange"] : "";
        $apiKey = isset($data["apiKey"]) ? $data["apiKey"] : "";
        $apiSecret = isset($data["exchange"]) ? $data["exchange"] : "";
        $default = isset($data["default"]) ? $data["default"] : false;
        if ($username && $password && $exchange) {
            $userId = Helper::rand(12);
            $exchangeId = Helper::rand(12);
            $user = array("id" => $userId, "username" => $username, "password" => $password);
            $exchange = array("id" => $exchangeId, "apiKey" => $apiKey, "apiSecret" => $apiSecret, "exchange" => $exchange, "userId" => $userId, "default" => $default);
            if ($command->exchange_class($exchange, $apiKey, $apiSecret) != NULL) {
                $command->save_user($user);
                $command->save_exchange($exchange);
                die(json_encode(array("code" => 200, "user" => $user, "exchange" => $exchange)));
            }
            die('{"code":403}');
        }
        die('{"code":403}');
    case "settings":
        $user = isset($data["user"]) ? $data["user"] : NULL;
        $exchanges = isset($data["exchanges"]) ? $data["exchanges"] : NULL;
        $errors = [];
        if ($user && $exchanges) {
            $command->save_user($user);
            foreach ($exchanges as $exchange) {
                if ($command->exchange_class($exchange["exchange"], $exchange["apiKey"], $exchange["apiSecret"]) != NULL) {
                    $exchange["userId"] = $user["id"];
                    $command->save_exchange($exchange);
                } else {
                    $errors[] = "invalid credentials for " . $exchange["exchange"];
                }
            }
            if (!count($errors)) {
                die(json_encode(array("code" => 200, "user" => $user, "exchanges" => $exchanges)));
            }
        }
        die('{"code":403 , "message":' . json_encode($errors) . '}');
    case "save_user":
        $username = isset($data["username"]) ? $data["username"] : NULL;
        $password = isset($data["password"]) ? $data["password"] : NULL;
        if (isset($data["username"]) && isset($data["password"])) {
            $command->save_user($data);
        }
        break;
    case "delete_user":
        $id = isset($data["id"]) ? $data["id"] : NULL;
        if ($id) {
            die($command->delete_user($id));
        }
        die('{"code":403}');
    case "delete_exchange":
        $id = isset($data["id"]) ? $data["id"] : NULL;
        if ($id) {
            die($command->delete_exchange($id));
        }
        die('{"code":403}');
    case "balance":
        $userId = isset($data["userId"]) ? $data["userId"] : NULL;
        $exchangeId = isset($data["exchangeId"]) ? $data["exchangeId"] : NULL;
        if ($userId && $exchangeId) {
            die(json_encode($command->balance($userId, $exchangeId)));
        }
        die('{"code":403}');
    case "symbols":
        $userId = isset($data["userId"]) ? $data["userId"] : NULL;
        $exchangeId = isset($data["exchangeId"]) ? $data["exchangeId"] : NULL;
        if ($userId && $exchangeId) {
            die(json_encode($command->symbols($userId, $exchangeId)));
        }
        die('{"code":403}');
    case "ticker":
        $symbol = isset($data["symbol"]) ? $data["symbol"] : NULL;
        $exchangeId = isset($data["exchangeId"]) ? $data["exchangeId"] : NULL;
        $userId = isset($data["userId"]) ? $data["userId"] : NULL;
        if ($userId && $exchangeId) {
            die(json_encode($command->ticker(new Trade(array("exchangeId" => $exchangeId, "userId" => $userId, 'ticker' => $symbol)))));
        }
        die('{"code":403}');

    case "tickers":
        $symbols = isset($data["symbols"]) ? $data["symbols"] : NULL;
        $exchangeId = isset($data["exchangeId"]) ? $data["exchangeId"] : NULL;
        $userId = isset($data["userId"]) ? $data["userId"] : NULL;
        if ($userId && $exchangeId) {
            die(json_encode($command->tickers($userId, $exchangeId, $symbols)));
        }
        die('{"code":403}');
        break;
    default:
        die('{"code":403}');
        break;
}