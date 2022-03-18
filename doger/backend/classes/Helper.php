<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */

class Helper
{
    public static function rand($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public static function telegram($token, $userId, $message)
    {
        $postData = array(
            'chat_id' => $userId,
            'text' => $message  // FIXME
        );

        $url = 'https://api.telegram.org/bot' . $token . '/sendMessage?' . http_build_query($postData);
        return file_get_contents($url);
    }

    public static function trace($message)
    {
        file_put_contents("error.txt", $message . "\n", FILE_APPEND);
    }

    public static function notify($trade)
    {
        return "to be implemented";
    }

}

