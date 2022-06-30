import {Card, Col, Container, Form, FormControl, FormText, Image} from "react-bootstrap";
import {useContext, useEffect, useState} from "react";
import {ServiceContext} from "../../index.js";

export const Content = () => {

    const {client} = useContext(ServiceContext);
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
        }
        reader.readAsDataURL(file);
    };

    return (<>
        <Container style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Col style={{
                paddingB: "4px",
                height: currentImage ? "auto" : "50vh",
                width: currentImage ? "auto" : "50vh",
                display: "flex",
                alignSelf: "center",
                justifyContent: "space-between",
                flexDirection: "column"
            }}>
                <Card style={{
                    display: "flex",
                    margin: "16px",
                    height: "100%",
                    alignItems: "center",
                    outlineColor: currentImage ? null : "darkgrey",
                    outlineStyle: currentImage ? null : "dotted",
                    backgroundColor: isDragging ? "lightgray" : null,
                    justifyContent: "center"
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
                }}>
                    {
                        currentImage ? <Image src={currentImage}
                                              style={{
                                                  height: "90vh",
                                                  maxWidth: "auto",
                                                  pointerEvents: "none"
                                              }}/> :
                            <FormText style={{
                                fontSize: "50px",
                                textAlign: "center",
                                pointerEvents: "none"
                            }}>{isDragging ? "DROP HERE" : "DRAG & DROP"}</FormText>
                    }
                </Card>
                <Form style={{display: "flex", justifyContent: "center"}}>
                    <FormControl type="file" onChange={event => {
                        processImage(event.target.files[0], setCurrentImage)
                    }}/>
                </Form>
            </Col>
        </Container>
    </>)
};