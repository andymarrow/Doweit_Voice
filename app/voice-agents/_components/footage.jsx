export default function Footage(){
    return(
        <footer className="pt-20 pb-10 px-6 border-t border-border-color bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
            
            <div>
              <h4 className="font-bold mb-6 text-text-main">Account</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Saving</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Join Accounts</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Crypto</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Freelance</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Commodities</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-text-main">Help</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Customer Help</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-text-main">Finance</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">Cards</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Linked Accounts</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Payment</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-text-main">Company</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Career</a></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1 flex flex-col items-start md:items-end">
              <span className="text-5xl font-bold tracking-tight text-primary mb-6">Doweit</span>
              <p className="text-xs text-text-secondary text-left md:text-right max-w-[200px] mb-6">
                Adama, Ethiopia. <br/>
              </p>
            </div>

          </div>

          <div className="pt-8 border-t border-border-color flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
            <div>
              © Doweit Voice Ltd {new Date().getFullYear()}.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-primary transition-colors">Disclosure</a>
            </div>
          </div>
        </div>
      </footer>
    )
}