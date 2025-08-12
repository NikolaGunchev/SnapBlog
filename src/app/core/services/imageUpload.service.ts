import { inject, Injectable } from "@angular/core";
import { getDownloadURL, ref, Storage, uploadBytes } from "@angular/fire/storage";

@Injectable({
  providedIn:'root'
})
export class ImageUploadService{
  private storage=inject(Storage)

  async uploadImage(file: File, path: string): Promise<string> {
    const filePath = `${path}${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    const uploadTask = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadTask.ref);
  }
}