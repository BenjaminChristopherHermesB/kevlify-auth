import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

function QRScanner({ onScan, onClose }) {
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const html5QrCodeRef = useRef(null);
    const isStoppingRef = useRef(false);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, []);

    async function stopScanner() {
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        console.log('Stopping scanner...');

        const scanner = html5QrCodeRef.current;
        if (scanner) {
            try {
                const state = scanner.getState();
                console.log('Scanner state:', state);

                if (state === Html5QrcodeScannerState.SCANNING) {
                    await scanner.stop();
                    console.log('Scanner stopped successfully');
                }
            } catch (e) {
                console.log('Stop error:', e.message);
            }

            try {
                scanner.clear();
                console.log('Scanner cleared');
            } catch (e) {
                console.log('Clear error:', e.message);
            }
        }

        html5QrCodeRef.current = null;

        // Force stop ALL video tracks in the browser
        try {
            const videoElements = document.querySelectorAll('video');
            videoElements.forEach(video => {
                const stream = video.srcObject;
                if (stream) {
                    stream.getTracks().forEach(track => {
                        track.stop();
                        console.log('Force stopped track:', track.label);
                    });
                    video.srcObject = null;
                }
            });
        } catch (e) {
            console.log('Force stop error:', e.message);
        }

        // Clear the container
        const container = document.getElementById('qr-reader');
        if (container) {
            container.innerHTML = '';
        }

        isStoppingRef.current = false;
        setScanning(false);
        console.log('Cleanup complete');
    }

    async function startScanner() {
        try {
            setScanning(true);
            setError('');

            // Wait for element to be in DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            const qrReaderElement = document.getElementById('qr-reader');
            if (!qrReaderElement) {
                throw new Error('QR reader element not found');
            }

            html5QrCodeRef.current = new Html5Qrcode('qr-reader');

            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                async (decodedText) => {
                    await stopScanner();
                    onScan(decodedText);
                },
                () => { }
            );

            console.log('Scanner started successfully');
        } catch (err) {
            console.log('Start error:', err);
            setError(
                err.name === 'NotAllowedError'
                    ? 'Camera access denied. Please allow camera access to scan QR codes.'
                    : 'Failed to start camera. Please ensure you have a camera connected.'
            );
            setScanning(false);
        }
    }

    async function handleClose() {
        await stopScanner();
        onClose();
    }

    return (
        <div className="qr-scanner">
            {error ? (
                <div className="qr-error">
                    <p role="alert">{error}</p>
                    <button className="std-btn primary" onClick={startScanner}>
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    <div id="qr-reader" className="qr-reader" />
                    {scanning && (
                        <p className="qr-hint">Point your camera at a TOTP QR code</p>
                    )}
                </>
            )}

            <div className="qr-actions">
                <button className="std-btn outline" onClick={handleClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default QRScanner;
