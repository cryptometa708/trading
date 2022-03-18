<?php

file_put_contents("cc.html", request("https://help.ftx.com/hc/en-us/sections/4414741387924-New-Listing-Announcements"));
function request($url)
{
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2,
        CURLOPT_CUSTOMREQUEST => 'GET'
    ));

    $response = curl_exec($curl);
    curl_close($curl);
    echo $response;
    return $response;
}

die();

$token = "1930919537:AAHh8DGAIHUUu7Uc9_Rb-TD4R1__t3ovBWU";
$channelId = "@cz_announcements";
$fileName = "lastAnnouncement.txt";

echo "start the script now";

$i = 1;
while (true) {
    if ($i == 101)
        $i = 1;
    $announcement = @file_get_contents("https://app-server-binance-$i.herokuapp.com/?command=announcement");
    if ($announcement === FALSE) {
        echo "\nERROR : app-server-binance-$i not found";
        $announcement = @file_get_contents("https://www.binance.com/bapi/composite/v1/public/cms/article/catalog/list/query?catalogId=48&pageNo=1&pageSize=10");
        sleep(10);
    }
    $announcement = json_decode($announcement);
    $lastAnnouncements = isset($announcement->data->articles) ? $announcement->data->articles : NULL;
    if ($lastAnnouncements != NULL) {
        $lastAnnouncement = $lastAnnouncements[0];
        $id = $lastAnnouncement->code;


        if (!file_exists($fileName)) {
            file_put_contents($fileName, $id);
        }
        $ids = file($fileName, FILE_IGNORE_NEW_LINES);
        if (!in_array($id, $ids)) {
            $ids = [$id, $ids[0]];
            $title = "📢" . $lastAnnouncement->title;
            $body = $title . "\nFor more details click on the link bellow \n\n";
            $body .= "🔗" . shorten("https://www.binance.com/en/support/announcement/" . $id);
            echo $body . "\n";
            telegram($token, "@binance_announcments", $body);
            file_put_contents($fileName, implode("\n", $ids));
        }
        $i++;
    }
    sleep(3);

}


function shorten($url)
{

    $data = "urlToShorten=" . urlencode($url);

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://api.shorte.st/v1/data/url');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');

    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

    $headers = array();
    $headers[] = 'Public-Api-Token: ba5c7e8fb9b1a90ed2adff80e8808582';
    $headers[] = 'Content-Type: application/x-www-form-urlencoded';
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);


    $response = json_decode($response);
    if (!$response || strcmp($response->status, "ok") !== 0) {
        return $url;
    }
    return $response->shortenedUrl;

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