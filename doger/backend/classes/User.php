<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */

class User implements JsonSerializable
{
    private $id;
    private $username;
    private $password;
    private $enabled;

    public function __construct($array = NULL)
    {
        if ($array != NULL) {
            $this->id = isset($array["id"]) ? $array["id"] : "";
            $this->username = isset($array["username"]) ? $array["username"] : "";
            $this->password = isset($array["password"]) ? $array["password"] : "";
            $this->enabled = isset($array["enabled"]) ? $array["enabled"] : "";
        }
    }

    /**
     * @return mixed|string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @return mixed|string
     */
    public function getEnabled()
    {
        return $this->enabled;
    }

    /**
     * @param mixed|string $enabled
     */
    public function setEnabled($enabled): void
    {
        $this->enabled = $enabled;
    }

    /**
     * @param mixed $username
     */
    public function setUsername($username): void
    {
        $this->username = $username;
    }

    /**
     * @param mixed|string $password
     */
    public function setPassword($password): void
    {
        $this->password = $password;
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


    public function jsonSerialize()
    {
        return
            [
                'id' => $this->getId(),
                'username' => $this->getUsername(),
                'password' => $this->getPassword(),
                'enabled' => $this->getEnabled(),
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