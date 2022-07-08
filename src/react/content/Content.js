import {Card, Container, Form, FormControl, FormText, Image, Stack} from "react-bootstrap";
import {useContext, useEffect, useState} from "react";
import {ServiceContext} from "../../index.js";
import {QrCodeImage} from "../qrcode/QrCodeImage.js";

export const Content = () => {

    const {uri, client} = useContext(ServiceContext);
    const [currentImage, setCurrentImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const onClientMessage = (type, body) => {
        switch (type) {
            case "image": {
                setCurrentImage(body.image);
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
    }, [client]);

    useEffect(() => {
        client.signal("image", {image: currentImage});
    }, [client, currentImage]);

    const processImage = (file, callback) => {
        const reader = new FileReader();
        reader.onload = () => {
            callback(reader.result);
        };
        reader.readAsDataURL(file);
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

    return (<>
        <Container style={{
            height: "100vh",
            width: "100vw",
            display: "block",
            alignSelf: "center",
            justifyContent: "center"
        }}>
            <Stack direction={"vertical"} style={{
                height: currentImage ? "auto" : "50vh",
                width: currentImage ? "auto" : "50vh",
                display: "block",
                alignSelf: "center",
                alignItems: "center"
            }}>
                <Card style={{
                    display: "flex",
                    margin: "16px",
                    height: "100%",
                    width: "auto",
                    alignItems: "center",
                    justifyContent: "center",
                    outlineColor: currentImage ? null : "darkgrey",
                    outlineStyle: currentImage ? null : "dotted"
                }} onDragOver={event => {
                    event.preventDefault();
                    setIsDragging(true);
                }} onDragLeave={event => {
                    event.preventDefault();
                    setIsDragging(false);
                }} onDrop={event => {
                    event.preventDefault();
                    processImage(event.dataTransfer.files[0], setCurrentImage);
                    setTimeout(() => setIsDragging(false), 500);
                }} onClick={() => currentImage ? saveAs(currentImage) : null}>
                    {
                        currentImage ? <Image src={currentImage}
                                              style={{
                                                  maxHeight: "50vh",
                                                  maxWidth: "100%",
                                                  pointerEvents: "none"
                                              }}/> :
                            <FormText style={{
                                fontSize: "50px",
                                textAlign: "center",
                                pointerEvents: "none"
                            }}>{isDragging ? "DROP HERE" : "DRAG & DROP"}</FormText>
                    }
                </Card>
                <Stack direction="horizontal" style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <Form style={{paddingBottom: "32px", display: "flex", justifyContent: "center"}}>
                        <FormControl type="file" onChange={event => {
                            processImage(event.target.files[0], setCurrentImage)
                        }}/>
                    </Form>
                    <QrCodeImage data={`http://${uri}:${window.location.port}`}/>
                    <FormText style={{width: "100%"}}>Scan to open</FormText>
                </Stack>
            </Stack>
        </Container>
    </>)
};