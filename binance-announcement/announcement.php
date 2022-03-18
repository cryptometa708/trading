<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */
//telegram data (change it if you want a production version)
$token = "bot_token";
$channelId = "@channel_id";
$user_id = "@user_id";
$fileName = "lastAnnouncement.txt";



echo "let's begin the work !";

while (true) {
    $announcement = @file_get_contents("https://www.binance.com/bapi/composite/v1/public/cms/article/catalog/list/query?catalogId=48&pageNo=1&pageSize=3");
    $announcement = json_decode($announcement);
    $lastAnnouncement = $announcement->data->articles[0];

    $id = $lastAnnouncement->code;

    if (!file_exists($fileName)) {
        file_put_contents($fileName, $id);
    }
    $ids = file($fileName, FILE_IGNORE_NEW_LINES);
    if (!in_array($id, $ids)) {
        $ids = [$id, $ids[0]];
        $title = "📢" . $lastAnnouncement->title;
        $body = $title . "\nFor more details click on the link bellow \n\n";
        $body .= "🔗" . "https://www.binance.com/en/support/announcement/" . $id;
        telegram($token, $user_id, $body);
        file_put_contents($fileName, implode("\n", $ids));
    }
    sleep(60);
}



function telegram($token, $userId, $message)
{
    $postData = array(
        "chat_id" => $userId,
        "text" => $message
    );

    $url = "https://api.telegram.org/bot" . $token . "/sendMessage?" . http_build_query($postData);
    return file_get_contents($url);
}