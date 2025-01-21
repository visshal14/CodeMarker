import React from 'react'
import { useAuth } from '../context/AuthContext';
import { Snackbar, Alert } from '@mui/material'
const AlertBox = () => {
    const { alertBox } = useAuth()

    return (
        <Snackbar open={alertBox?.show} autoHideDuration={4000} >
            {alertBox?.type === "success" || alertBox?.type === "Success" || alertBox?.type === "succes" || alertBox?.type === "Succes" || alertBox?.type !== "error" ?
                <Alert variant="filled" severity="success" sx={{ width: '100%' }
                }> {alertBox?.message} </Alert>
                :
                <Alert variant="filled" severity="error" sx={{ width: '100%' }}> {alertBox?.message} </Alert>}
        </Snackbar>
    )
}

export default AlertBox