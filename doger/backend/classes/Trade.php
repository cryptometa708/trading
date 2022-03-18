<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */
class Trade implements JsonSerializable
{
    private $id;
    private $ticker;
    private $price;
    private $creationDate;
    private $executionDate;
    private $amount;
    private $command;
    private $exchangeId;
    private $state;
    private $userId;
    private $pnl;

    public function __construct($data = NULL)
    {
        if ($data != NULL) {
            $this->id = isset($data["id"]) ? $data["id"] : NULL;
            $this->userId = isset($data["userId"]) ? $data["userId"] : "";
            $this->exchangeId = isset($data["exchangeId"]) ? $data["exchangeId"] : "";
            $this->ticker = isset($data["ticker"]) ? $data["ticker"] : "";
            $this->price = isset($data["price"]) ? $data["price"] : 0;
            $this->creationDate = isset($data["creationDate"]) ? $data["creationDate"] : "";//date("Y-m-d h:i")
            $this->executionDate = isset($data["executionDate"]) ? $data["executionDate"] : "";
            $this->amount = isset($data["amount"]) ? $data["amount"] : 0;
            $this->command = isset($data["command"]) ? $data["command"] : "";
            $this->state = isset($data["state"]) ? $data["state"] : "";
            $this->pnl = isset($data["pnl"]) ? $data["pnl"] : 0;
        }

    }

    /**
     * @param int|mixed $pnl
     */
    public function setPnl($pnl): void
    {
        $this->pnl = $pnl;
    }

    /**
     * @return int|mixed
     */
    public function getPnl()
    {
        return $this->pnl;
    }

    /**
     * @return mixed|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed|null $id
     */
    public function setId($id): void
    {
        $this->id = $id;
    }

    /**
     * @return mixed|string
     */
    public function getTicker()
    {
        return $this->ticker;
    }

    /**
     * @param mixed|string $ticker
     */
    public function setTicker($ticker): void
    {
        $this->ticker = $ticker;
    }

    /**
     * @return mixed|string
     */
    public function getPrice()
    {
        return $this->price;
    }

    /**
     * @param mixed|string $price
     */
    public function setPrice($price): void
    {
        $this->price = $price;
    }

    /**
     * @return mixed|string
     */
    public function getCreationDate()
    {
        return $this->creationDate;
    }

    /**
     * @param mixed|string $creationDate
     */
    public function setCreationDate($creationDate): void
    {
        $this->creationDate = $creationDate;
    }

    /**
     * @return mixed|string
     */
    public function getExecutionDate()
    {
        return $this->executionDate;
    }

    /**
     * @param mixed|string $executionDate
     */
    public function setExecutionDate($executionDate): void
    {
        $this->executionDate = $executionDate;
    }

    /**
     * @return mixed|string
     */
    public function getAmount()
    {
        return $this->amount;
    }

    /**
     * @param mixed|string $amount
     */
    public function setAmount($amount): void
    {
        $this->amount = $amount;
    }

    /**
     * @return mixed|string
     */
    public function getCommand()
    {
        return $this->command;
    }

    /**
     * @param mixed|string $command
     */
    public function setCommand($command): void
    {
        $this->command = $command;
    }

    /**
     * @return mixed|string
     */
    public function getExchangeId()
    {
        return $this->exchangeId;
    }

    /**
     * @param mixed|string $exchangeId
     */
    public function setExchangeId($exchangeId): void
    {
        $this->exchangeId = $exchangeId;
    }

    /**
     * @return mixed|string
     */
    public function getState()
    {
        return $this->state;
    }

    /**
     * @param mixed|string $state
     */
    public function setState($state): void
    {
        $this->state = $state;
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
     * @return array
     */
    public function jsonSerialize()
    {
        return
            [
                'id' => $this->getId(),
                'ticker' => $this->getTicker(),
                'exchangeId' => $this->getExchangeId(),
                'price' => $this->getPrice(),
                'creationDate' => $this->getCreationDate(),
                'executionDate' => $this->getExecutionDate(),
                'amount' => $this->getAmount(),
                'command' => $this->getCommand(),
                'userId' => $this->getUserId(),
                'state' => $this->getState(),
                'pnl' => $this->getPnl(),
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