import { createClient } from '@supabase/supabase-js'
import { BUCKET_NAME, SUPABASE_KEY, SUPABASE_URL } from '../config/config.js'


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
)
const bucketName = BUCKET_NAME
const random = Math.floor(Math.random() * 100000)

const storage = {
    upload: async (file) => {
        try {
            const fileName = `${Date.now()}-${random}-${file.originalname}`
            const { data, error } = await supabase
                .storage
                .from(bucketName)
                .upload(fileName, file.buffer, {
                    cacheControl: '3600',
                    contentType: file.mimetype,
                    upsert: false
                })

            if (error) throw uploadError

            const { data: urlData } = supabase
                .storage
                .from(bucketName)
                .getPublicUrl(data.path)

            return {
                path: data.path,
                url: urlData.publicUrl
            }
        } catch (error) {
            throw error
        }
    },

    delete: async (filePath) => {
        const { error } = await supabase
            .storage
            .from(bucketName)
            .remove([filePath])
        if (error) throw error
    }
}

export default storage