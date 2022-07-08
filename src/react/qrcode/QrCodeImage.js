import {toDataURL} from "qrcode";
import {useEffect, useRef} from "react";
import {Image} from "react-bootstrap";

export const QrCodeImage = ({data}) => {

    const image = useRef(null);

    useEffect(() => {
        toDataURL(data).then(result => {
            image.current.src = result;
        }).catch(console.error);
    }, [data]);

    return (<Image ref={image}/>)
};