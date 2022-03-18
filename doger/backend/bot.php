<?php
/**
 * Author Said Thitah
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */
include_once "vendor/autoload.php";
include_once "classes/Helper.php";
include_once "classes/Trade.php";
include_once "classes/User.php";
include_once "classes/Connection.php";
include_once "classes/Exchange.php";
include_once "classes/Database.php";
include_once "classes/Command.php";

//get the command instance as a singleton object
$command = Command::getInstance();

while (true) {
    //return all database trades that are opened
    $trades = $command->trades(NULL, NULL, true);
    $message = "Current trades = ".count($trades)."\n";

    foreach ($trades as $trade) {
        try {
            $message .= lookup($command, $trade);
        } catch (Exception $e) {
            Helper::trace("Error : $e");
            $message .= "Error : $e";
        }
    }
    echo chr(27) . chr(91) . 'H' . chr(27) . chr(91) . 'J'.$message;
}
/**
 * @param $command
 * @param $trade
 * @return string that represent few data about the current trade
 *
 */
function lookup($command, $trade)
{
    $symbol = $trade->getTicker();
    $price = $trade->getPrice();
    $ticker = $command->ticker($trade);
    $trade_type = $trade->getCommand();
    $message = "$symbol -> current price = " . $ticker["close"] . "\t||\ttrade price = " . $price . "\t||\ttrade type =" . $trade_type . "\n";
    $pnl = 0;
    $state = 1;
    if (strpos($trade_type, 'buy') !== false) {
        $condition = $ticker["close"] <= $price;
    } else {
        /*
         *
         * if it a sell order we submit the gain or lose amount and the closed state
         * state = -1 -> order in cancel state
         * state = 0  -> order in open state
         * state = 1  -> order in execution state
         * state = 2  -> order in closed state
         */
        $condition = $ticker["close"] >= $price;
        $pnl = 1;
        $state = 2;
    }
    if ($condition) {
        $command->execute_trade($trade->getId(), $state, $pnl);
        /*
         * notify the user that his order has been executed
         */
        Helper::notify($trade);
    }
    return $message;
}


