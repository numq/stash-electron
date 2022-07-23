import {useCallback, useContext, useEffect, useState} from "react";
import {ServiceContext} from "../../index.js";
import {QrCodeImage} from "../qrcode/QrCodeImage.js";
import {Button, Carousel, Form, Image, Stack} from "react-bootstrap";
import JSZip from "jszip";
import * as FileSaver from "file-saver";
import {ImageFile} from "./ImageFile.js";

export const Files = () => {

    const {uri, client} = useContext(ServiceContext);
    const [images, setImages] = useState([]);

    const urlFromFile = image => {
        const file = JSON.parse(image);
        return `data:image/${file.extension};base64,${file.blob}`;
    };

    const fileFromUrl = url => JSON.stringify(ImageFile(url.split(";")[0].split("/")[1], url.split(",")[1]));

    const onClientMessage = useCallback((type, body) => {
        switch (type) {
            case 'file': {
                if (body.extension && body.blob) {
                    const image = JSON.stringify(ImageFile(body.extension, body.blob));
                    setImages(prevState => prevState.indexOf(image) < 0 ? [...prevState, image] : prevState);
                }
                break;
            }
            case 'refresh': {
                images.forEach(image => client.signal('file', image));
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
            callback(fileFromUrl(reader.result));
        };
        reader.readAsDataURL(image);
    };

    const processFiles = files => {
        const types = ['image/jpeg', 'image/jpg', 'image/png'];
        [...files].filter(f => types.includes(f.type)).forEach(file => {
            processImage(file, image => client.signal('file', image));
        });
    };

    const clearFiles = () => client.signal('clear');

    const saveAsFile = async (extension, file) => FileSaver.saveAs(file, `${Date.now()}.${extension}`);

    const saveSingle = async file => saveAsFile(JSON.parse(file).extension, urlFromFile(file));

    const saveMultiple = async data => data.forEach(saveAsFile);

    const saveZip = async data => {
        const zip = JSZip();
        const folder = zip.folder(Date.now().toString());
        data.forEach((file, idx) => {
            const image = JSON.parse(file);
            folder.file(`${Date.now()}${idx}.${image.extension}`, image.blob, {base64: true});
        })
        folder.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        }).then(file => saveAsFile("zip", file));
    };

    return (
        <Stack direction={"vertical"} style={{height: "100%", width: "auto"}}>
            <Stack direction={"vertical"} style={{alignItems: "center"}}>
                <Form style={{height: "auto", width: "50%"}}>
                    <Form.Control type="file" multiple label="Select files or drag them here" onChange={event => {
                        event.stopPropagation();
                        event.preventDefault();
                        processFiles(event.target.files)
                    }} onDragOver={event => {
                        event.stopPropagation();
                        event.preventDefault();
                    }} onDragLeave={event => {
                        event.stopPropagation();
                        event.preventDefault();
                    }} onDrop={event => {
                        event.stopPropagation();
                        event.preventDefault();
                        processFiles(event.dataTransfer.files);
                    }}/>
                </Form>
                <Stack direction={"horizontal"} style={{height: "auto", alignSelf: "center"}}>
                    {
                        images.length > 0 ?
                            <Stack style={{width: "fit-files", alignItems: "center", justifyContent: "center"}}
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
                                    <Image src={urlFromFile(image)}
                                           style={{height: "75vh", width: "auto"}}
                                           onClick={() => saveSingle(image)}/>
                                </Carousel.Item>
                            )
                        }
                        </Carousel> : null
                }
            </Stack>
        </Stack>
    )
};