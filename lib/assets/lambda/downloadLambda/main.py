import boto3
from cryptography.fernet import Fernet

def download_file(bucket_name, object_name, s3_client):
    response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
    encrypted_data = response['Body'].read()
    return encrypted_data

def decrypt_data_key(encrypted_key, kms_client):
    response = kms_client.decrypt(CiphertextBlob=encrypted_key)
    plaintext_key = response['Plaintext']
    return plaintext_key

def decrypt_file(encrypted_data, decrypted_key):
    fernet = Fernet(decrypted_key)
    return fernet.decrypt(encrypted_data)

def main():
    s3_client = boto3.client('s3')
    kms_client = boto3.client('kms')

    bucket_name = 'awskmsstack-tests3bucketkms2663e1b1-fzmuo9cm3tbp'
    object_name = 'test.txt'

    # Replace this with the actual retrieval of your encrypted data key
    # For example, it could be stored as S3 object metadata or in a separate file
    encrypted_key = b'your-encrypted-key'

    encrypted_data = download_file(bucket_name, object_name, s3_client)
    decrypted_key = decrypt_data_key(encrypted_key, kms_client)
    decrypted_data = decrypt_file(encrypted_data, decrypted_key)

    # Save or process the decrypted data
    with open('path/to/save/decrypted-file', 'wb') as file:
        file.write(decrypted_data)

    print("File was successfully downloaded and decrypted.")

if __name__ == "__main__":
    main()