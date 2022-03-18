<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */
class Connection
{
    private static $dbConnection = null;


    private function __construct()
    {
    }

    private function __clone()
    {
    }

    public static function getConnection($database)
    {
        if (!self::$dbConnection) {
            try {
                self::$dbConnection = new PDO('sqlite:db/'.$database.".db");
                self::$dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                self::trace('error in connection ' . $e->getMessage(), "error");
            }
        }
        // return the connection
        return self::$dbConnection;
    }

    public static function trace($message, $type = "info")
    {
        $file = "logs/" . $type . "-" . date("d-m-Y") . ".log";

        file_put_contents($file, date("H:i") . " - " . $message . "\n", FILE_APPEND);
    }
}