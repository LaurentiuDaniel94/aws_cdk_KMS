import boto3
from cryptography.fernet import Fernet

def encrypt_file(file_path, kms_client, key_id):
    # Use the existing KMS key to generate a data key
    data_key_response = kms_client.generate_data_key(KeyId=key_id, KeySpec='AES_256')
    data_key_plaintext = data_key_response['Plaintext']
    data_key_encrypted = data_key_response['CiphertextBlob']

    # Encrypt the file data
    fernet = Fernet(data_key_plaintext)
    with open(file_path, 'rb') as file:
        encrypted_data = fernet.encrypt(file.read())

    return encrypted_data, data_key_encrypted

def upload_file(encrypted_data, bucket_name, object_name, s3_client):
    s3_client.put_object(Bucket=bucket_name, Key=object_name, Body=encrypted_data)

def main():
    s3_client = boto3.client('s3')
    kms_client = boto3.client('kms')

    # Your existing KMS key ID or alias
    kms_key_id = "aeae5f1b-0f55-445a-a163-1475405c50e2"

    file_path = 'lib/assets/file_to_upload/test.txt'
    bucket_name = 'awskmsstack-tests3bucketkms2663e1b1-fzmuo9cm3tbp'
    object_name = 'test.txt'

    encrypted_data, _ = encrypt_file(file_path, kms_client, kms_key_id)
    upload_file(encrypted_data, bucket_name, object_name, s3_client)

    print(f"File {file_path} was successfully encrypted and uploaded.")

if __name__ == "__main__":
    main()