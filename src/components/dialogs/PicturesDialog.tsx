import { useEffect, useState } from "react";
import { invoke } from "@/scripts/config/tauri";
import { Button, Checkbox, Dialog, Loading } from "@midwest-diesel/mwd-ui";

interface Picture {
  url: string
  name: string
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  pictures: Picture[]
  stockNum: string
}


export default function PicturesDialog({ open, setOpen, pictures, stockNum }: Props) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const DIRECTORY = `\\\\MWD1-SERVER\\Server\\Pictures\\sn_specific\\${stockNum}`;

  useEffect(() => {
    if (!open) return;
    setSelectedImages([]);
  }, [open, stockNum]);

  const editSelectedImages = (checked: boolean, name: string) => {
    if (checked) { 
      setSelectedImages([...selectedImages, name]);
    } else {
      setSelectedImages(selectedImages.filter((pic) => pic !== name));
    }
  };

  const openFolder = async () => {
    await invoke('view_file', { filepath: DIRECTORY });
  };
  

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Pictures"
      width={650}
      height={520}
      className="part-pictures-dialog"
    >
      <Button onClick={openFolder}>Open Folder</Button>

      { pictures.length === 0 && <Loading /> }
      {pictures.map((pic: Picture, i) => {
        return (
          <div key={i} className="part-pictures-dialog__img-container">
            <img
              src={`data:image/png;base64,${pic.url}`}
              alt={pic.name}
              width={240}
              height={240}
            />

            <Checkbox
              variant={['label-fit', 'dark-bg']}
              checked={selectedImages.includes(pic.name)}
              onChange={(e: any) => editSelectedImages(e.target.checked, pic.name)}
            />
          </div>
        );
      })}
    </Dialog>
  );
}
