import { Injectable } from '@angular/core';
import {  ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Storage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUpload } from '../shared/file-upload.model';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  public file: File | null = null;

  constructor() {} 

  
}

