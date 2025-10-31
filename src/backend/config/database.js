import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
    dialect:'sqlite',
    storage:'database.sqlite'
    }
)

export default sequelize