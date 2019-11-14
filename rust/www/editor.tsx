import React from 'react'

import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

class Editor extends React.Component {
    render() {
        return <div>
            <h1>Editor</h1>
            <InputGroup className="mb-3">
                <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-default">Rule Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    aria-label="Default"
                    aria-describedby="inputGroup-sizing-default"
                />
            </InputGroup>
            <div className="horizontal-row">
                <div className="input"></div>
                <div className="output"></div>
            </div>
        </div>
    }
}

export default Editor