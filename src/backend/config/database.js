import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    dialect:'sqlite',
    storage:'src/backend/database.sqlite'
})

export default sequelize