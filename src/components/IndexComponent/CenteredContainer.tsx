import React from 'react'
import Container from 'react-bootstrap/Container'

interface CenteredContainerProps {
    children?: React.ReactNode;
}

const CenteredContainer: React.FC<CenteredContainerProps> = ({ children }) => {
    return (
        <Container
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: "92vh",
                flexDirection: "column"
            }}
            className="text-center"
        >
            {children}
        </Container>
    )
}

export default CenteredContainer