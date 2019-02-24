import React from 'react';
import { Button } from 'react-bootstrap';

class ShiftUpButton extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            row: {},
        }
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    componentDidMount() {
        this.setState({
            row: this.props.row,
        });
    }

    handleButtonClick() {
        const swapOrder = () => this.props.CustomFunction(this.state.row.ordering, 'up');
        swapOrder();
    }

    componentDidUpdate() {
        if (this.props.row['activity_id'] !== this.state.row['activity_id']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    render() {
        return(
            <div>
                <Button bsStyle="primary" onClick={this.handleButtonClick}>Shift Up</Button>
            </div>
        )
    }
}

export default ShiftUpButton;
