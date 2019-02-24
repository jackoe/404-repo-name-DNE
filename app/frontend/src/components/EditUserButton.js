import React from 'react';
import { Button } from 'react-bootstrap';
import EditUserModal from './EditUserModal';

class EditUserButton extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            row: {},
            showUserModal: false,
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.closeModalDelete = this.closeModalDelete.bind(this);
    }

    componentDidMount() {
        this.setState({
            row: this.props.row,
        });
    }

    openModal() {
        this.setState({showUserModal: true});
    }

    closeModal(user=null) {
        if (user !== null) {
            const updateUser = () => this.props.CustomFunction(user);
            updateUser();
        }
        this.setState({showUserModal: false});
    }

    closeModalDelete(id=null) {
        this.setState({showUserModal: false});
        if (id !== null) {
            const updateUser = () => this.props.CustomFunction(null, id);
            updateUser();
        }
    }

    componentDidUpdate() {
        if (this.props.row['id'] !== this.state.row['id']) {
            this.setState({
                row: this.props.row,
            })
        }
    }

    render() {
        return(
            <div>
                <EditUserModal show={this.state.showUserModal} row={this.props.row} onDelete={this.closeModalDelete} onSubmit={this.closeModal}/>
                <Button bsStyle="link" onClick={this.openModal}>Edit User</Button>
            </div>
        )
    }
}

export default EditUserButton;
