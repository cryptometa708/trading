<?php
/**
 * Author ibrahim jamali
 * this script is a simple infinite loop search for new trades to execute and spot price changes
 */
class Database
{

    private static $instance = null;
    private $connection = null;

    private function __construct($connection)
    {
        $this->connection = $connection;
    }

    private function __clone()
    {
    }

    public static function getInstance($connection)
    {
        if (self::$instance == null) {
            self::$instance = new Database($connection);
        }
        return self::$instance;
    }


    public function insert($object)
    {
        $table_name = strtoupper(get_class($object));
        $data = $object->get_object_vars();
        $arrayKeys = array_keys($data);
        $keys = "";
        $values = "";
        for ($i = 0; $i < count($arrayKeys); $i++) {
            $key = $arrayKeys[$i];
            $value = $data[$key];
            if ($value != NULL && $value !== '') {
                $keys .= "," . $key;
                $values .= ",'" . $value . "'";
            }
        }
        $sql = "INSERT INTO {$table_name} (" . ltrim($keys, ",") . ") VALUES (" . ltrim($values, ",") . ");";
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
        } catch (PDOException $e) {
            Connection::trace("Error : " . $e->getMessage(), "error");
            return "{\"code\":404 , \"message\":{$e->getMessage()}}";
        }
        Connection::trace("row has been added to {$table_name}");
        return '{"code":200}';

    }

    public function update($object)
    {
        $table_name = strtoupper(get_class($object));
        $data = $object->get_object_vars();
        $id = trim($data["id"]);
        $sql = "";
        foreach ($data as $key => $value) {
            if ($value !== '') {
                $sql .= "$key = '$value',";
            }
        }
        $sql = rtrim($sql, ',');
        $sql = "UPDATE {$table_name} SET {$sql} WHERE ID='{$id}'";
        try {
            $this->connection->exec($sql);
        } catch (PDOException $e) {
            Connection::trace("Error in  update(" . $sql . ") -> " . $e->getMessage(), "error");
            return "{\"code\":404 , \"message\":{$e->getMessage()}}";
        }
        Connection::trace(json_encode($object) . " has been updated.");
        return '{"code":200}';

    }

    public function save($object)
    {
        if ($this->count($object) == 0) {
            return $this->insert($object);

        } else {
            return $this->update($object);
        }

    }


    public function count($object)
    {
        $table_name = strtoupper(get_class($object));
        $data = $object->get_object_vars();
        $id = isset($data["id"]) ? trim($data["id"]) : NULL;
        if ($id != NULL) {
            $sql = "SELECT COUNT(*) FROM {$table_name} WHERE id='{$id}';";
            $count = 0;
            try {
                $stmt = $this->connection->query($sql);
                $count = $stmt->fetchColumn();

            } catch (PDOException $e) {
                Connection::trace("Error in  getAll({$sql}) -> " . $e->getMessage(), "error");
            }
            return $count;
        }
        return 0;
    }


    public function create($object)
    {
        $table_name = strtoupper(get_class($object));
        $sql = "";
        $data = $object->get_object_vars();
        foreach (array_keys($data) as $key) {
            $sql .= "{$key} TEXT NOT NULL,";
        }
        $sql = rtrim($sql, ',');

        $sql = "DROP TABLE IF EXISTS {$table_name}; CREATE TABLE {$table_name} ({$sql})";
        try {
            $this->connection->exec($sql);
        } catch (PDOException $e) {
            Connection::trace("Error in  delete {$table_name}({$sql}) -> {$e->getMessage()}", "error");
            return "{\"code\":404 , \"message\":{$e->getMessage()}}";
        }
        Connection::trace("create {$table_name} succesfully");
        return '{"code":200}';
    }

    public function delete($object)
    {
        $table_name = strtoupper(get_class($object));
        $data = $object->get_object_vars();
        $id = trim($data["id"]);
        $sql = "DELETE FROM {$table_name} WHERE id='{$id}';";
        try {
            $this->connection->exec($sql);
        } catch (PDOException $e) {
            Connection::trace("Error in  delete {$table_name}({$sql}) -> {$e->getMessage()}", "error");
            return "{\"code\":404 , \"message\":{$e->getMessage()}}";
        }
        Connection::trace("delete {$id} from {$table_name} succesfully");
        return '{"code":200}';
    }


    public function deleteAll($object)
    {
        $table_name = strtoupper(get_class($object));
        $sql = "DELETE FROM {$table_name};";

        try {
            $this->connection->exec($sql);
        } catch (PDOException $e) {
            Connection::trace("Error in  deleteAll from {$table_name}(" . $sql . ") -> " . $e->getMessage(), "error");
            return "{\"code\":404 , \"message\":{$e->getMessage()}}";
        }
        Connection::trace("delete all {$table_name} succesfully");
        return '{"code":200}';

    }


    public function getAll($object)
    {
        $class_name = get_class($object);
        $table_name = strtoupper($class_name);
        $data = $object->get_object_vars();
        $condition = "";
        $objects = [];
        foreach ($data as $key => $value) {
            if ($data[$key] != '')
                $condition .= "$key = '$data[$key]' and ";
        }

        $condition = rtrim($condition, ' and ');
        $sql = "SELECT * FROM {$table_name}";
        if (!empty($condition))
            $sql .= " WHERE {$condition};";
        try {
            $stmt = $this->connection->query($sql);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $row) {
                $objects[] = new $class_name($row);
            }
        } catch (PDOException $e) {
            Connection::trace("Error in  getAll({$sql}) -> " . $e->getMessage(), "error");
        }
        return $objects;
    }


    public function get($object)
    {
        $all = $this->getAll($object);
        return $all != null ? $all[0] : NULL;
    }


}