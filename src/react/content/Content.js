import {useCallback, useContext, useEffect, useState} from "react";
import {ServiceContext} from "../../index.js";
import {QrCodeImage} from "../qrcode/QrCodeImage.js";
import {Button, Carousel, Form, Image, Stack} from "react-bootstrap";
import JSZip from "jszip";
import * as FileSaver from "file-saver";

export const Content = () => {

    const {uri, client} = useContext(ServiceContext);
    const [images, setImages] = useState([]);

    const onClientMessage = useCallback((type, body) => {
        switch (type) {
            case 'image': {
                setImages(prevState => prevState.indexOf(body.image) < 0 ? [...prevState, body.image] : prevState);
                break;
            }
            case 'refresh': {
                images.forEach(image => client.signal('image', {image: image}));
                break;
            }
            case 'clear': {
                setImages([]);
                break;
            }
            default: {
                break;
            }
        }
    }, [client, images]);

    useEffect(() => {
        setTimeout(() => client.signal('refresh', {}), 2 * 1000);
        return () => {
            client.close();
        }
    }, [client]);

    useEffect(() => {
        client.initialize(onClientMessage);
    }, [client, onClientMessage]);

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
            processImage(file, image => client.signal('image', {image: image}));
        });
    };

    const clearFiles = () => client.signal('clear');

    const saveAsFile = async file => FileSaver.saveAs(file, Date.now().toString());

    const saveMultiple = async data => data.forEach(saveAsFile);

    const saveZip = async data => {
        const zip = JSZip();
        const folder = zip.folder(Date.now().toString());
        data.forEach(image => folder.file(image.name + ".jpg", image.slice(image.indexOf(",") + 1), {base64: true}))
        folder.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        }).then(saveAsFile);
    };

    return (
        <Stack direction={"vertical"} style={{height: "100%", width: "auto"}}>
            <Stack direction={"vertical"} style={{alignItems: "center"}}>
                <Form style={{height: "auto", width: "50%"}}>
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
                <Stack direction={"horizontal"} style={{height: "auto", alignSelf: "center"}}>
                    {
                        images.length > 0 ?
                            <Stack style={{width: "fit-content", alignItems: "center", justifyContent: "center"}}
                                   gap={1}>
                                <Button variant={"secondary"}
                                        style={{height: "auto", width: "100%", textAlign: "center"}}
                                        onClick={() => saveMultiple(images)}>Save
                                    all</Button>
                                <Button variant={"secondary"}
                                        style={{height: "auto", width: "100%", textAlign: "center"}}
                                        onClick={() => saveZip(images)}>Save as
                                    ZIP</Button>
                                <Button variant={"danger"} style={{height: "auto", width: "100%", textAlign: "center"}}
                                        onClick={() => clearFiles()}>Clear files</Button>
                            </Stack> : null
                    }
                    <QrCodeImage data={`http://${uri}:${window.location.port}`}/>
                </Stack>
                {
                    images.length > 0 ?
                        <Carousel style={{alignSelf: "center"}} controls={images.length > 1} interval={null}>{
                            Array.from(images).map((image, idx) =>
                                <Carousel.Item key={Date.now() + idx} style={{height: "auto", width: "auto"}}>
                                    <Image src={image}
                                           style={{height: "75vh", width: "auto"}}
                                           onClick={() => saveAsFile(image)}/>
                                </Carousel.Item>
                            )
                        }
                        </Carousel> : null
                }
            </Stack>
        </Stack>
    )
};