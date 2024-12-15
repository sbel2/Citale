import { createClient } from '@/supabase/client';
import React, {useState, FormEvent, ChangeEvent } from 'react';
import Image from "next/legacy/image";
import { categories } from '@/components/constants';

 
//const supabaseUrl = 'https://qteefmlwxyvxjvehgjvp.supabase.co';
//const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZWVmbWx3eHl2eGp2ZWhnanZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg0OTMwNzEsImV4cCI6MjAzNDA2OTA3MX0.0WpgnrcrRn44rev_4P7Duyjo_PAXM2rETQWrlu5SZAI';
const supabase = createClient();

//export 
//export function ToggleForm() {
  //const [showForm, changeDisplay] = useState(false);

//}

export default function PostForm({showPostForm} : {showPostForm: boolean}) {
      console.log('Bazing!')
      const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        mediaUrl: "",
        category: "",
      });

      function handleInput(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        
        const fieldName = e.target.name;
        // Check if the input is a file input
        if (e.target instanceof HTMLInputElement && e.target.type === "file") {
          const fileList = e.target.files;
          console.log(fileList)
          
          if (fileList) {
            const filesArray = Array.from(fileList).map((file) => URL.createObjectURL(file));
            console.log(filesArray)
            // Update form state with all file URLs
            setFormData((prevState) => ({
              ...prevState,
              [fieldName]: filesArray, // Store the file URLs as an array
            }));
          }
        } else {
          // For other input types
          const fieldValue = e.target.value;

          setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue,
          }));
        }

        console.log(formData)
      }

      function submitForm(e: FormEvent) {
        e.preventDefault();
      
        console.log(formData);
      
        async function postData() {
            const { data, error } = await supabase
            .from('testPost')
            .insert([formData]);
      
            if (error) {
                console.error('Error Posting data:', error);
                return;
            }
      
            console.log('Data posted!!')
        };
      
        postData();
      }
      
      console.log('Boom')
      if (showPostForm == true) {return (
        <div style={styles.total}>
          <form onSubmit={submitForm} style={styles.form}>
              <p style={styles.title}>Post an Event!</p>
              <label htmlFor="eventdata" style={styles.label}>Event Title:
                <input 
                  type="text" 
                  id="eventdata"
                  name="title" 
                  value={formData.title}
                  onChange={handleInput}
                  style={styles.input}
                  required
                />
              </label>
              <label htmlFor="locationdata" style={styles.label}>Location:
                <input 
                  type="text" 
                  id="locationdata"
                  name="location"  
                  value={formData.location}
                  onChange={handleInput}
                  style={styles.input}
                />
              </label>
              <div className="flex">
                <label htmlFor="descriptiondata"style={styles.label}>Description:</label>
                <textarea
                    id="descriptiondata"
                    rows={3}
                    cols={40}
                    name="description"  
                    value={formData.description}
                    onChange={handleInput}
                    style={styles.input}
                  />
              </div>
              <label htmlFor="urldata" style={styles.label}>Upload Image:
                <input
                  type="file" 
                  id="urldata"
                  name="mediaUrl" 
                  multiple
                  accept=".jpg, .jpeg, .png, .svg, .gif"
                  //value={formData.mediaUrl}
                  onChange={handleInput}
                  style={styles.specialInput}
                  required
                />
              </label>
              <label htmlFor="category" style={styles.label}> Event Type(s):
                <select name="category" id="category" onChange={handleInput} value={formData.category} style={styles.specialInput}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <input type="submit" value="Create Post" style={styles.submit}/>
          </form>
          <div>

          </div>
        </div>
        )
    }}


    const styles = {
      total: {
        display: 'flex',
        position: 'fixed' as const,
        left: '30%',
        justifyContent: 'center',
        zIndex: 10,
        width: '40%',
        //height: '60%',
      },

      form: {
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100%',
        minWidth: '500px',
        margin: '20px 10px',
        boxShadow: '0 4px 400px 0 rgba(0, 0, 0, 0.2), 0 6px 400px 0 rgba(0, 0, 0, 0.19)',
        borderRadius: '15px',
        backgroundColor: 'white',
      },

      title: {
        alignSelf: 'center',
        fontSize: 'large',
        //fontFamily: 'Inter SemiBold 600', eventually bold title
        margin: '25px 0px 10px',
      },

      input: {
        backgroundColor: '#f2f3f4',
        borderRadius: '3px',
        margin: '10px 5px',
      },

      label: {
        margin: '0px 25px',
      },

      specialInput: {
        margin: '10px 5px',
      },

      submit: {
        border: '1px white solid',
        borderRadius: '10px',
        backgroundColor: '#ff0000',
        color: 'white',
        margin: '10px 10px',
        alignSelf: 'flex-end',
        width: '40%',
        height: '35px',
        cursor: 'pointer',
      }
    }



//          <option value="Photography">Photography</option>
              //  <option value="Back Bay">Back Bay</option>
               // <option value="Beacon Hill">Beacon Hill</option>
               // <option value="Shopping">Shopping</option>
               // <option value="Other">Other</option>
               //onClick={() => handleFilterClick(category)}>