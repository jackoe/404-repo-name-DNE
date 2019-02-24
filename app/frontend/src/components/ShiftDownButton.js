import React from 'react';
import { Button } from 'react-bootstrap';

class ShiftDownButton extends React.Component {
    
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
        const swapOrder = () => this.props.CustomFunction(this.state.row.ordering, 'down');
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
                <Button onClick={this.handleButtonClick}>Shift Down</Button>
            </div>
        )
    }
}

export default ShiftDownButton;
