import React from 'react';
import { Shield, FileText, MapPin, Phone, Mail } from 'lucide-react';

const ConsentContent = ({ language, versionContent, userData, formData }) => {
  // Use content from Policy Manager if available
  if (versionContent && versionContent.content) {
    const content = versionContent.content;
    
    // Check content type and render accordingly
    // 1. Check if it's Markdown (contains markdown indicators)
    const isMarkdown = content.includes('##') || content.includes('**') || content.includes('- ') || content.includes('* ');
    
    // 2. Check if it's HTML
    const isHTML = content.includes('<') && content.includes('>');
    
    if (isMarkdown && !isHTML) {
      // Convert Markdown to HTML for display
      const convertMarkdownToHTML = (md) => {
        let html = md;
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Lists
        html = html.replace(/^\* (.+)/gim, '<li class="ml-4 mb-1">• $1</li>');
        html = html.replace(/^- (.+)/gim, '<li class="ml-4 mb-1">• $1</li>');
        html = html.replace(/^\d+\. (.+)/gim, '<li class="ml-4 mb-1">$1</li>');
        // Line breaks - preserve double line breaks as paragraphs
        html = html.split('\n\n').map(para => `<p class="mb-4">${para}</p>`).join('');
        // Single line breaks within paragraphs
        html = html.replace(/\n/g, '<br/>');
        return html;
      };
      
      return (
        <div className="p-6">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(content) }} 
          />
        </div>
      );
    }
    
    if (isHTML) {
      return (
        <div className="p-6">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>
      );
    }
    
    // Plain text - preserve line breaks and formatting
    return (
      <div className="p-6">
        <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
          {content}
        </div>
      </div>
    );
  }
  
  // Default hardcoded content as fallback
  const fullName = userData?.nameSurname || userData?.fullName || 'XXXXXXXXXXXXXXXXXXXXXXX';
  const idNumber = formData?.idPassport || 'N-NNNN-NNNNN-NN-N';

  // Select content based on language prop - STRICT language separation
  const contentByLanguage = {
    th: {
      title: 'หนังสือให้ความยินยอมในการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล',
      institute: 'สถาบันวิจัยและพัฒนาอัญมณีและเครื่องประดับแห่งชาติ (องค์การมหาชน)',
      intro: `ข้าพเจ้า ${fullName} เลขที่บัตรประจำตัวประชาชน ${idNumber} โดยต่อไปในหนังสือให้ความยินยอมฉบับนี้เรียกว่า "เจ้าของข้อมูล" ตกลงยินยอมให้ สถาบันวิจัยและพัฒนาอัญมณีและเครื่องประดับแห่งชาติ (องค์การมหาชน) ซึ่งต่อไปนี้จะเรียกว่า "สถาบัน" สามารถเก็บรวบรวม ใช้ หรือ เปิดเผย ข้อมูลส่วนบุคคลของข้าพเจ้าที่มีอยู่กับ สถาบันภายใต้เงื่อนไข ดังต่อไปนี้`,
      sections: [
        {
          title: '1. วัตถุประสงค์การเก็บรวบรวม ใช้ หรือเปิดเผย',
          content: 'การให้ความยินยอมเพื่อวัตถุประสงค์ทางการตลาด ทั้งนี้เพื่อให้การบริการตรงตามต้องการของลูกค้า สถาบันจะใช้ข้อมูลส่วนบุคคลของลูกค้า เพื่อที่ลูกค้าจะสามารถได้รับผลิตภัณฑ์และ/หรือบริการที่ตรงตามวัตถุประสงค์ของลูกค้าตามสัญญาหรือตามที่ลูกค้าร้องขอ ในกรณีดังต่อไปนี้',
          items: [
            '1.1 การพิจารณาอนุมัติและ/หรือให้บริการต่าง ๆ เช่น การสมัครสมาชิกสถาบัน การสมัครสมาชิกโครงการซื้อด้วยความมั่นใจ และการใช้บริการอื่นๆ ของสถาบัน',
            '1.2 การดำเนินการใด ๆ ที่เกี่ยวข้องกับการพัฒนาผลิตภัณฑ์และ/หรือให้บริการต่าง ๆ เช่น การประมวลผล การติดต่อ การแจ้ง การมอบงานให้แก่บุคคลอื่นที่เป็นผู้ให้บริการภายนอก การโอนสิทธิและ/หรือหน้าที่',
            '1.3 การนำเสนอสิทธิประโยชน์พิเศษ คำแนะนำ และข่าวสารต่าง ๆ รวมถึงสิทธิในการเข้าร่วมกิจกรรมพิเศษ เป็นต้น'
          ]
        },
        {
          title: '2. ข้อมูลที่จัดเก็บ',
          items: [
            '2.1 ชื่อ-นามสกุล',
            '2.2 ที่อยู่',
            '2.3 เลขที่บัตรประชาชน',
            '2.4 เบอร์โทรศัพท์',
            '2.5 อีเมล'
          ]
        },
        {
          title: '3. ระยะเวลาในการเก็บรักษาข้อมูลส่วนบุคคล',
          content: 'สถาบันจะเก็บรวบรวมข้อมูลส่วนบุคคลของเจ้าของข้อมูลไว้ และขอสงวนสิทธิ์เก็บข้อมูลต่อไปอีกเป็นระยะเวลา 5 ปี ภายหลังจากเจ้าของข้อมูลยกเลิกการใช้บริการ เพื่อประโยชน์ในการปกป้อง และต่อสู้สิทธิต่างๆ ของสถาบัน เว้นแต่กฎหมายที่เกี่ยวข้องกำหนดให้สถาบันจำเป็นต้องเก็บข้อมูลส่วนบุคคลไว้เป็นอย่างอื่น สถาบัน อาจมีความจำเป็นต้องเก็บข้อมูลไว้เป็นระยะเวลาเกินกว่าที่ระบุข้างต้น'
        },
        {
          title: '4. การเปิดเผยข้อมูลส่วนบุคคล',
          items: [
            '4.1 สถาบันจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอกโดยปราศจากการอนุญาตจากเจ้าของข้อมูล',
            '4.2 สถาบันอาจเปิดเผยข้อมูลส่วนบุคคลของเจ้าของข้อมูลภายใต้หลักเกณฑ์ตามที่กฎหมายกำหนดหรือเปิดเผยต่อเจ้าพนักงาน เจ้าหน้าที่รัฐ หรือหน่วยงานที่มีอำนาจเพื่อปฏิบัติตามคำสั่งหรือคำขอที่ชอบด้วยกฎหมาย',
            '4.3 สถาบันอาจเปิดเผยข้อมูลส่วนบุคคลของผู้รับบริการ โดยมีวัตถุประสงค์เพื่อการพัฒนาและปรับปรุงการให้บริการของสถาบันเท่านั้น'
          ],
          subItems: [
            '• พันธมิตรทางธุรกิจ',
            '• ผู้ให้บริการภายนอกที่สถาบันว่าจ้างให้จัดกิจกรรมประชาสัมพันธ์ หรือจัดงานแสดงสินค้าต่างๆ',
            '• ผู้ให้บริการภายนอกที่สถาบันว่าจ้างให้จัดทำการสำรวจความพึงพอใจ',
            '• ผู้ให้บริการประมวลผลข้อมูลทั้งในและต่างประเทศ',
            '• หน่วยงานหรือเจ้าหน้าที่ของรัฐที่ใช้อำนาจหน้าที่ตามกฎหมาย'
          ],
          footer: 'โดยในการเปิดเผยข้อมูลส่วนบุคคลให้แก่บุคคลดังกล่าว สถาบันจะดำเนินการให้บุคคลเหล่านั้นเก็บรักษาข้อมูลส่วนบุคคลของผู้ใช้บริการไว้เป็นความลับ และไม่นำไปใช้เพื่อวัตถุประสงค์อื่น นอกเหนือจากขอบเขตที่สถาบันได้กำหนดไว้'
        },
        {
          title: '5. ผลกระทบของการไม่ให้ความยินยอมจากเจ้าของข้อมูลส่วนบุคคล',
          content: 'สถาบันอาจไม่สามารถได้รับข้อมูลที่ครบถ้วน เพื่อใช้ในการติดต่อให้บริการ โดยเฉพาะกรณีที่มีการจัดส่งสินค้า ของสมนาคุณ หรือของรางวัล ให้กับผู้ร่วมกิจกรรม นำเสนอสิทธิประโยชน์พิเศษ คำแนะนำ และข่าวสารต่าง ๆ รวมถึงสิทธิในการเข้าร่วมกิจกรรมพิเศษ เป็นต้น'
        },
        {
          title: '6. การส่งหรือโอนข้อมูลไปยังต่างประเทศ',
          content: 'สถาบันจะไม่ส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ'
        },
        {
          title: '7. สิทธิของเจ้าของข้อมูลส่วนบุคคล',
          items: [
            '7.1 เพิกถอนความยินยอมแก่สถาบันในการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล',
            '7.2 ขอเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลที่เกี่ยวกับตน',
            '7.3 คัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล',
            '7.4 ขอให้สถาบันดำเนินการลบหรือทำลาย หรือทำให้ข้อมูลส่วนบุคคลเป็นข้อมูลที่ไม่สามารถระบุตัวบุคคล',
            '7.5 ขอให้สถาบันระงับการใช้ข้อมูลส่วนบุคคลได้',
            '7.6 แจ้งให้สถาบันดำเนินการให้ข้อมูลส่วนบุคคลของตนถูกต้องเป็นปัจจุบัน',
            '7.7 ร้องเรียนในกรณีที่สถาบันฝ่าฝืนหรือไม่ปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล'
          ]
        },
        {
          title: '8. ช่องทางการติดต่อ',
          content: 'เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (ฝ่ายนโยบายและแผน)',
          contact: {
            address: 'ที่อยู่ : 140, 140/1-3, 140/5 อาคารไอทีเอฟ-ทาวเวอร์ ชั้นที่ 6 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร 10500',
            phone: 'โทรศัพท์ : 02 634 4999 ต่อ 611',
            fax: 'แฟกซ์ : 0 2634 4970',
            email: 'อีเมล : dpo@git.or.th'
          }
        }
      ],
      acknowledgment: 'ข้าพเจ้าได้รับทราบนโยบายคุ้มครองข้อมูลส่วนบุคคลของสถาบันในข้อกำหนดและเงื่อนไขในการเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าตามวัตถุประสงค์ ดังที่ได้อธิบายไว้ข้างต้นเป็นที่เรียบร้อยแล้วและขอให้ความยินยอมแก่สถาบันดังต่อไปนี้'
    },
    en: {
      title: 'Personal Data Collection, Use, and Disclosure Consent Form',
      institute: 'The Gem and Jewelry Institute of Thailand (Public Organization)',
      intro: `I, ${fullName}, ID/Passport Number ${idNumber}, hereinafter referred to as the "Data Subject", hereby consent to The Gem and Jewelry Institute of Thailand (Public Organization), hereinafter referred to as the "Institute", to collect, use, or disclose my personal data held by the Institute under the following conditions:`,
      sections: [
        {
          title: '1. Purposes of Collection, Use, or Disclosure',
          content: 'Consent for marketing purposes to provide services that meet customer needs. The Institute will use customer personal data so that customers can receive products and/or services that meet their objectives according to contracts or customer requests in the following cases:',
          items: [
            '1.1 Consideration of approval and/or provision of various services such as Institute membership, Buy with Confidence program membership, and other Institute services',
            '1.2 Any operations related to product development and/or service provision such as processing, communication, notification, assignment to external service providers, transfer of rights and/or duties',
            '1.3 Presentation of special benefits, recommendations, and various news including rights to participate in special activities'
          ]
        },
        {
          title: '2. Data Collected',
          items: [
            '2.1 Name-Surname',
            '2.2 Address',
            '2.3 ID Card Number',
            '2.4 Phone Number',
            '2.5 Email'
          ]
        },
        {
          title: '3. Personal Data Retention Period',
          content: 'The Institute will collect and retain the data subject\'s personal data for a period of 5 years after the data subject cancels the service for the benefit of protecting and defending various rights of the Institute, unless relevant laws require the Institute to retain personal data otherwise. The Institute may need to retain data for a period exceeding that specified above.'
        },
        {
          title: '4. Personal Data Disclosure',
          items: [
            '4.1 The Institute will not disclose your personal data to external parties without permission from the data subject',
            '4.2 The Institute may disclose the data subject\'s personal data under legal criteria or disclose to officials, government officers, or authorized agencies to comply with lawful orders or requests',
            '4.3 The Institute may disclose service recipients\' personal data solely for the purpose of developing and improving the Institute\'s services'
          ],
          subItems: [
            '• Business partners',
            '• External service providers hired by the Institute to organize promotional activities or exhibitions',
            '• External service providers hired by the Institute to conduct satisfaction surveys',
            '• Data processing service providers both domestic and international',
            '• Government agencies or officials exercising legal authority'
          ],
          footer: 'In disclosing personal data to such parties, the Institute will ensure that those parties maintain the confidentiality of service users\' personal data and do not use it for purposes other than the scope defined by the Institute.'
        },
        {
          title: '5. Impact of Not Providing Consent',
          content: 'The Institute may not receive complete information for service contact, especially in cases of product delivery, complimentary gifts, or prizes to participants, presentation of special benefits, recommendations, and various news including rights to participate in special activities.'
        },
        {
          title: '6. Cross-Border Data Transfer',
          content: 'The Institute will not send or transfer personal data to foreign countries.'
        },
        {
          title: '7. Rights of the Data Subject',
          items: [
            '7.1 Withdraw consent to the Institute for collecting, using, or disclosing personal data',
            '7.2 Access and request copies of personal data concerning oneself',
            '7.3 Object to the collection, use, or disclosure of personal data',
            '7.4 Request the Institute to delete, destroy, or anonymize personal data',
            '7.5 Request the Institute to suspend the use of personal data',
            '7.6 Notify the Institute to ensure personal data is accurate and current',
            '7.7 File complaints if the Institute violates or fails to comply with personal data protection laws'
          ]
        },
        {
          title: '8. Contact Information',
          content: 'Data Protection Officer (Policy and Planning Department)',
          contact: {
            address: 'Address: 140, 140/1-3, 140/5 ITF Tower, 6th Floor, Silom Road, Suriyawong, Bangrak, Bangkok 10500',
            phone: 'Phone: 02 634 4999 ext. 611',
            fax: 'Fax: 0 2634 4970',
            email: 'Email: dpo@git.or.th'
          }
        }
      ],
      acknowledgment: 'I acknowledge that I have been informed of the Institute\'s personal data protection policy regarding the terms and conditions for disclosing my personal data for the purposes described above, and I hereby grant my consent to the Institute as follows:'
    }
  };

  // Use ONLY the content for the selected language
  const currentContent = contentByLanguage[language] || contentByLanguage['th'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <Shield className="w-12 h-12" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
          {currentContent.title}
        </h1>
        <p className="text-center mt-2 text-blue-100">
          {currentContent.institute}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-xl shadow-lg p-6 sm:p-8">
        {/* Introduction */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
            {currentContent.intro}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                {section.title}
              </h2>
              
              {section.content && (
                <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
                  {section.content}
                </p>
              )}
              
              {section.items && (
                <ul className="space-y-2 ml-4">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="text-sm sm:text-base text-gray-700 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {section.subItems && (
                <div className="mt-4 ml-8 space-y-1">
                  {section.subItems.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {item}
                    </div>
                  ))}
                </div>
              )}
              
              {section.footer && (
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  {section.footer}
                </p>
              )}
              
              {section.contact && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{section.contact.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{section.contact.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{section.contact.fax}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{section.contact.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Acknowledgment */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm sm:text-base text-green-800 font-medium">
            {currentContent.acknowledgment}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentContent;
