# Exam Management

Enabling this module creates the headless CMS content model:

- **Exam**: title, description
- **Subject**: title, description, exam reference
- **Material**: title, type (`video` or `pdf`), URL, content, subject reference
- **Quiz**: title, subject reference, question, four options, correct answer

Quiz is deliberately a separate content type. The React app shows Materials and
Quiz as separate tabs on the same subject page.

## Enable

```powershell
.\vendor\bin\drush en exam_management jsonapi -y
```

For a local decoupled frontend, allow `http://localhost:5173` in Drupal's CORS
settings (`web/sites/default/services.yml`) and rebuild the cache.

The JSON:API resources are available at:

- `/jsonapi/node/exam`
- `/jsonapi/node/subject?filter[field_em_exam.id]=EXAM_UUID`
- `/jsonapi/node/material?filter[field_em_subject.id]=SUBJECT_UUID`
- `/jsonapi/node/quiz?filter[field_em_subject.id]=SUBJECT_UUID`
