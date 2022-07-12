import {useContext, useEffect, useState} from "react";
import {ServiceContext} from "../../index.js";
import {QrCodeImage} from "../qrcode/QrCodeImage.js";
import {Carousel, Form, Image, Stack} from "react-bootstrap";

export const Content = () => {

    const {uri, client} = useContext(ServiceContext);
    const [images, setImages] = useState([]);

    const sendImage = image => {
        client.signal('image', {image: image});
        setImages(prevState => prevState.includes(image) ? prevState : [...prevState, image]);
    };

    const onClientMessage = (type, body) => {
        switch (type) {
            case "image": {
                sendImage(body.image);
                break;
            }
            default: {
                break;
            }
        }
    };

    useEffect(() => {
        client.initialize(onClientMessage);
        return () => {
            client?.close();
        }
    }, []);

    const processImage = (image, callback) => {
        const reader = new FileReader();
        reader.onload = () => {
            callback(reader.result);
        };
        reader.readAsDataURL(image);
    };

    const processFiles = files => {
        const types = ['image/jpeg', 'image/jpg', 'image/png'];
        [...files].filter(f => types.includes(f.type)).forEach(file => {
            processImage(file, sendImage);
        });
    };

    const saveAs = async blob => {
        const a = document.createElement('a');
        a.download = "download";
        a.href = blob;
        a.onclick = _ => {
            setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
        };
        a.click();
    };

    return (
        <Stack direction={"vertical"}
               style={{
                   padding: "32px",
                   height: "100%",
                   display: "flex",
                   alignContent: "start",
                   justifyContent: "center"
               }}>
            <Stack direction={"horizontal"}
                   style={{
                       display: "flex",
                       alignItems: "center",
                       justifyContent: "center",
                       maxHeight: "25vh"
                   }}>
                <Form style={{height: "auto", width: "50%", padding: "16px"}}>
                    <Form.Control type="file" multiple label="Select files or drag them here" onChange={
                        event => processFiles(event.target.files)
                    } onDragOver={event => {
                        event.preventDefault();
                    }} onDragLeave={event => {
                        event.preventDefault();
                    }} onDrop={event => {
                        event.preventDefault();
                        processFiles(event.dataTransfer.files);
                    }}/>
                </Form>
                <QrCodeImage data={`http://${uri}:${window.location.port}`}/>
            </Stack>
            {
                images.length > 0 ?
                    <Carousel style={{alignSelf: "center"}}
                              controls={images.length > 1}>{
                        Array.from(images).map((image, idx) =>
                            <Carousel.Item>
                                <Image src={image} key={idx} onClick={() => saveAs(image)}
                                       style={{height: "75vh"}}/>
                            </Carousel.Item>
                        )
                    }
                    </Carousel>
                    : null
            }
        </Stack>
    )
};