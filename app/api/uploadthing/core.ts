import { auth, getSession } from '@/lib/auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  organizationLogo: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getSession();
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Organization logo uploaded for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId };
    }),

  imageUploader: f({ image: { maxFileSize: '8MB', maxFileCount: 8 } })
    .middleware(async ({ }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId };
    }),
  studentProfileImage: f({ image: { maxFileSize: '8MB', maxFileCount: 8 } })
    .middleware(async ({ }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId };
    }),
  idCardPdf: f({ pdf: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('ID card PDF uploaded:', file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
