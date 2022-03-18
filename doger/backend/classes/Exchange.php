<?php

class Exchange implements JsonSerializable
{
    private $id;
    private $exchange;
    private $apiKey;
    private $apiSecret;
    private $userId;
    private $main;

    public function __construct($data = NULL)
    {
        if ($data != NULL) {
            $this->id = isset($data["id"]) ? $data["id"] : "";
            $this->exchange = isset($data["exchange"]) ? $data["exchange"] : "";
            $this->userId = isset($data["userId"]) ? $data["userId"] : "";
            $this->apiKey = isset($data["apiKey"]) ? $data["apiKey"] : "";
            $this->main = isset($data["main"]) ? $data["main"] : "";
            $this->apiSecret = isset($data["apiSecret"]) ? $data["apiSecret"] : "";
        }

    }

    /**
     * @return mixed|string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed|string $id
     */
    public function setId($id): void
    {
        $this->id = $id;
    }

    /**
     * @return mixed|string
     */
    public function getExchange()
    {
        return $this->exchange;
    }

    /**
     * @param mixed|string $exchange
     */
    public function setExchange($exchange): void
    {
        $this->exchange = $exchange;
    }

    /**
     * @return mixed|string
     */
    public function getApiKey()
    {
        return $this->apiKey;
    }

    /**
     * @param mixed|string $apiKey
     */
    public function setApiKey($apiKey): void
    {
        $this->apiKey = $apiKey;
    }

    /**
     * @return mixed|string
     */
    public function getApiSecret()
    {
        return $this->apiSecret;
    }

    /**
     * @param mixed|string $apiSecret
     */
    public function setApiSecret($apiSecret): void
    {
        $this->apiSecret = $apiSecret;
    }

    /**
     * @return mixed|string
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @param mixed|string $userId
     */
    public function setUserId($userId): void
    {
        $this->userId = $userId;
    }

    /**
     * @return mixed|string
     */
    public function getMain()
    {
        return $this->main;
    }

    /**
     * @param mixed|string $main
     */
    public function setMain($main): void
    {
        $this->main = $main;
    }



    /**
     * @return array
     */
    public function jsonSerialize()
    {
        return
            [
                'id' => $this->getId(),
                'exchange' => $this->getExchange(),
                'apiSecret' => $this->getApiSecret(),
                'apiKey' => $this->getApiKey(),
                'main' => $this->getMain(),
                'userId' => $this->getUserId(),
            ];
    }

    /**
     * very important to add this method to your classes if you want map them to database
     * @return array
     */
    public function get_object_vars()
    {
        return get_object_vars($this);
    }

}