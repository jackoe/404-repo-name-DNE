import React from 'react';
import { Button } from 'react-bootstrap';
import EditRoleModal from './EditRoleModal';

class EditRoleButton extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            row: {},
            showModal: false,
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
        this.setState({showModal: true});
    }

    closeModal(role=null) {
        const { row } = this.state;
        if (role !== null) {
            this.props.row.permissions = role.permissions;
            row.permissions = role.permissions;
        }
        this.setState({showModal: false, row: row});
    }

    closeModalDelete(id=null) {
        this.setState({showModal: false});
        if (id !== null) {
            const deleteRole = () => this.props.CustomFunction(id);
            deleteRole();
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
                <EditRoleModal show={this.state.showModal} row={this.props.row} onDelete={this.closeModalDelete} onSubmit={this.closeModal}/>
                <Button bsStyle="link" onClick={this.openModal}>Edit User Role</Button>
            </div>
        )
    }
}

export default EditRoleButton;
