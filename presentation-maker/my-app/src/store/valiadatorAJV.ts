import Ajv from "ajv"
import { presentationSchema } from "./presentationSchema"

export const ajv = new Ajv()
export const validatePresentation = ajv.compile(presentationSchema)