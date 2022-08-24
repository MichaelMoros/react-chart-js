import React from 'react'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

type CenteredErrorMessageProps = {
    reason: string
    customHeight?: number
    refresh?: string
}

const CenteredErrorMessage: React.FC<CenteredErrorMessageProps> = ({ reason, customHeight, refresh = null }) => {
    const baseUrl = window.location.origin

    return (
        <Container
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: customHeight ? `${customHeight}vh` : "92vh",
                flexDirection: "column"
            }}
        >
            <h4 className="my-0 py-0">Error Handler</h4>
            <small>{reason}</small>
            <Button size="sm" className="mt-2" onClick={() => !refresh ? window.location.href = baseUrl : window.location.reload()}>Refresh Page</Button>
        </Container>
    )
}

export default CenteredErrorMessage