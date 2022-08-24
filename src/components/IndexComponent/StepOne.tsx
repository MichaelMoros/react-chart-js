import Form from 'react-bootstrap/Form'
import { InfoCircle } from 'react-bootstrap-icons'
import { ActionTypes } from '../../enums/enums'
import { Nullable } from '../../types/types'


type StepOneProps = {
    action: Exclude<ActionTypes, ActionTypes.NoAction>
    fileHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
    error: Nullable<string>
}

const StepOne: React.FC<StepOneProps> = ({ fileHandler, error, action }) => {
    const isMultiple = action === ActionTypes.CompareAndCreate

    return (
        <div>
            <h5 className="my-0 py-0">Import your data</h5>

            {
                isMultiple && (
                    <div className="mt-2">
                        <small><InfoCircle color="blue" size="14" style={{ marginBottom: "4px" }} /> Limit: Two(2), rest will be ignored. </small>
                        <div>
                            <small><InfoCircle color="blue" size="14" style={{ marginBottom: "4px" }} /> Both files must have same column and property type/s.</small>
                        </div>
                    </div>
                )
            }

            <Form.Group controlId="formFile" className="mt-2">
                <Form.Label>Accepts file .json and .csv</Form.Label>
                <Form.Control type="file" accept=".json, .csv" onChange={fileHandler} multiple={isMultiple} />
                {
                    error && <small className="mt-3" style={{ color: "red" }}><strong>*{error}</strong></small>
                }
            </Form.Group>
        </div>
    )
}

export default StepOne