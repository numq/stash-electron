import {toDataURL} from "qrcode";
import {useEffect, useRef} from "react";
import {Figure} from "react-bootstrap";

export const QrCodeImage = ({data}) => {

    const image = useRef(null);

    useEffect(() => {
        toDataURL(data).then(result => {
            image.current.src = result;
        }).catch(console.error);
    }, [data]);

    return (
        <Figure style={{width: "auto", display: "grid", pointerEvents: "none"}}>
            <Figure.Image ref={image}/>
            <Figure.Caption>
                <p className={"text-center"}>Scan to get URL</p>
            </Figure.Caption>
        </Figure>
    )
};