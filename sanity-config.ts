import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

export default {
  projectId: process.env.SANITY_PROJECT_ID ,
  dataset: process.env.SANITY_DATASET  ,
}