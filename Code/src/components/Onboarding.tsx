import React, { useState } from 'react'

const Onboarding: React.FC = () => {
    const [newPoint, setNewPoint] = useState<string>('')

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setNewPoint('')
        }
    }

    return (
        <div className='note-ui'>
            <h1 className='note-title'>
                Onboarding Session
                {/* <hr style={{ width: '75%', border: '1px dashed #566949' }} /> */}
            </h1>
        </div>
    );
};

export default Onboarding