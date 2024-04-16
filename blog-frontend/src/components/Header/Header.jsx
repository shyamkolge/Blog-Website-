import React, { useState } from 'react'
import { images } from '../../constants'
import { AiOutlineMenu , AiOutlineClose} from "react-icons/ai";
import { MdKeyboardArrowDown} from "react-icons/md";


const navItemInfo = [
      { name : 'Home' , type : "link"}, 
      { name : 'Articles' , type : "link"}, 
      { name : 'Pages', type : "dropdown", items : ['About us ', 'Contact us'] }, 
      { name : 'pricing', type : "link" }, 
      { name : 'Faq', type : "link" }, 
];


const NavItems = ({ item }) =>{

 const [dropdown , setDropdown] = useState(false);

 const toggleDropdownHandler = () =>{
     setDropdown((curState) => {
         return !curState;
     })
 }

  return (
   <li className='relative group'>
  { 
    item.type === "link" ? (
      <>
         <a href="/" className='px-4 py-2'>
             {item.name}
          </a>
          <span className='cursor-pointer text-blue-500 absolute font-bold transition-all duration-500 top-0 right-0 group-hover:right-[90%] opacity-0 group-hover:opacity-100'>
            /
          </span> 
       </>
       
       ) : (
         <div className='flex flex-col items-center'>
         <button className='px-4 py-2 flex gap-x-1 items-center' 
                 onClick= { toggleDropdownHandler }>
            <span>{item.name}</span>
            <MdKeyboardArrowDown/>
          </button>

          <div 
            className={` ${ 
              dropdown ? "block" : "hidden" } 
              lg:hidden transition-all duration-500 pt-4 lg:absolute lg:bottom-0 lg:right-0 lg:transform lg:translate-y-full lg:group-hover:block w-max `}>

            <ul className='bg-dark-soft lg:bg-transparent text-center flex flex-col shadow-lg rounded-lg overflow-hidden'>
                {
                   item.items.map((page) =>(
                      
                           <a href="/" className='hover:bg-dark-hard hover:text-white px-4 py-2 text-white lg:text-dark-hard '>
                              {page}
                           </a>
                      
                   ))
                }
            </ul>
           </div>
        </div>  
    )}     
  </li>
)}


const Header = () => {
    
  const [navIsVisible, setNavIsVisible] = useState(false);

  const NavVisibilityHandler = () =>{
      setNavIsVisible((curState) => {
           return !curState;
      });
  } 

  return (
    <section className='sticky top-0 left-0 right-0 z-50 bg-white'>
       <header className='container mx-auto px-5 flex justify-between py-2 items-center'>
           
           {/* logo  */}
           <div className='w-14'>
              <img src={images.Logo} alt="logo" />
            </div>

           {/* Menu Icon  */}
           <div className='lg:hidden z-50'>
                 { navIsVisible ? ( 
                   <AiOutlineClose className='h-6 w-6' onClick={NavVisibilityHandler}/> 
                   ): ( 
                    <AiOutlineMenu className='w-6 h-6' onClick={NavVisibilityHandler}/> 
                    
                  )}
           </div>

            {/* NavItems  */}
           <div className={`${ navIsVisible ? "right-0" : "-right-full" } transition-all duration-300 mt-[72px] lg:mt-0 bg-dark-hard lg:bg-transparent z-[49] flex flex-col w-full lg:w-auto justify-center lg:justify-end lg:flex-row fixed top-0 bottom-0  lg:static gap-x-9 items-center`}>
               <ul className='text-white gap-y-5 lg:text-dark-soft flex gap-x-2 flex-col lg:flex-row items-center font-semibold'>
                    {
                      navItemInfo.map((item)=>(
                          <NavItems key={item.name} item ={item}/>
                      ))
                    }
               </ul>

               <button className='mt-5 lg:mt-0 border-2 border-blue-500 px-6 py-2 text-blue-500 font-semibold hover:text-white hover:bg-blue-500 transition-all duration-300 rounded-full cursor-pointer'>Sing in</button>
           </div>


       </header>
    </section>
  )
}

export default Header